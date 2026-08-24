import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import { TokenService } from './token.service';
import { RedisService } from '../../common/services/redis.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  AuthTokens,
  JwtPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const PASSWORD_RESET_TTL_SECONDS = 3600; // 1 hour
const PASSWORD_RESET_PREFIX = 'password_reset:';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Register a new user.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Find the role
    const roleName = dto.role || 'CANDIDATE';
    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Hash password
    const passwordHash = await this.tokenService.hashPassword(dto.password);

    // Create user with role
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        status: AccountStatus.ACTIVE, // In production: PENDING_VERIFICATION
        emailVerified: false,
        userRoles: {
          create: { roleId: role.id },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    // Create profile based on role
    if (roleName === 'CANDIDATE') {
      await this.prisma.candidateProfile.create({
        data: {
          userId: user.id,
          headline: '',
          profileCompleteness: 10,
        },
      });
    }

    // Generate tokens
    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      tenantId: user.tenantId,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    this.logger.log(`User registered: ${user.email} with role ${roleName}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantId: user.tenantId,
      },
      tokens,
    };
  }

  /**
   * Authenticate a user with email and password.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active. Please contact support.');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    // Verify password
    const isValid = await this.tokenService.comparePassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) {
      const newAttempts = user.loginAttempts + 1;
      const updateData: Record<string, unknown> = {
        loginAttempts: newAttempts,
      };

      // Lock account after exceeding max attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        this.logger.warn(
          `Account locked for ${user.email} after ${newAttempts} failed attempts`,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed login attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      tenantId: user.tenantId,
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantId: user.tenantId,
      },
      tokens,
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const decoded = this.tokenService.decodeRefreshToken(refreshToken);

    if (!decoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Look up the user to build a fresh payload
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Generate new pair with the same family
    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      tenantId: user.tenantId,
    };

    return this.tokenService.generateRotatedTokenPair(payload, decoded.family);
  }

  /**
   * Logout — revoke the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Get the current user from JWT payload.
   */
  async getMe(userId: string): Promise<Omit<AuthResponse['user'], 'tenantId'> & { tenantId: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userRoles.map((ur) => ur.role.name),
      tenantId: user.tenantId,
    };
  }

  /**
   * Initiate a forgot-password flow — generates a reset token stored in Redis.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.debug(
        `Password reset requested for unknown email: ${dto.email}`,
      );
      return { message: 'If an account exists with that email, a reset link has been sent.' };
    }

    // Generate a reset token
    const resetToken = uuidv4();
    await this.redisService.set(
      `${PASSWORD_RESET_PREFIX}${resetToken}`,
      user.id,
      PASSWORD_RESET_TTL_SECONDS,
    );

    // In production, send the email via MailHog / SMTP
    // For development, log the token
    this.logger.log(
      `Password reset token for ${user.email}: ${resetToken}`,
    );

    return {
      message: 'If an account exists with that email, a reset link has been sent.',
    };
  }

  /**
   * Reset a user's password using a reset token.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const userId = await this.redisService.get(
      `${PASSWORD_RESET_PREFIX}${dto.token}`,
    );

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete the used token
    await this.redisService.del(`${PASSWORD_RESET_PREFIX}${dto.token}`);

    this.logger.log(`Password reset completed for user ${userId}`);

    return { message: 'Password has been reset successfully.' };
  }

  /**
   * Change password for the currently authenticated user.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.tokenService.comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.logger.log(`Password changed for user ${userId}`);

    return { message: 'Password changed successfully.' };
  }
}
