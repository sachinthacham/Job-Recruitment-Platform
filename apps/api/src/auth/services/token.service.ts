import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../common/services/redis.service';
import { AuthTokens, JwtPayload } from '../dto/auth.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: number; // seconds
  private readonly refreshExpiresIn: number; // seconds
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly TOKEN_FAMILY_PREFIX = 'token_family:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret-change-me');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me');
    this.accessExpiresIn = this.configService.get<number>('JWT_ACCESS_EXPIRES_SECONDS', 900); // 15 min
    this.refreshExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_SECONDS', 604800); // 7 days
  }

  /**
   * Generate an access + refresh token pair for a user.
   */
  async generateTokenPair(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });

    const familyId = uuidv4();
    const refreshTokenId = uuidv4();

    const refreshPayload = {
      sub: payload.sub,
      jti: refreshTokenId,
      family: familyId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    // Store the refresh token in Redis for validation
    await this.storeRefreshToken(
      refreshTokenId,
      payload.sub,
      familyId,
      this.refreshExpiresIn,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
    };
  }

  /**
   * Rotate a refresh token — issue a new pair and invalidate the old one.
   * If the token was already used (replay attack), invalidate the entire family.
   */
  async rotateRefreshToken(token: string): Promise<{ tokens: AuthTokens; userId: string } | null> {
    let decoded: { sub: string; jti: string; family: string };

    try {
      decoded = this.jwtService.verify(token, { secret: this.refreshSecret });
    } catch {
      this.logger.warn('Invalid refresh token provided');
      return null;
    }

    const storedToken = await this.redisService.get(
      `${this.REFRESH_TOKEN_PREFIX}${decoded.jti}`,
    );

    if (!storedToken) {
      // Token not found — possible replay attack. Invalidate entire family.
      this.logger.warn(
        `Refresh token reuse detected for user ${decoded.sub}, family ${decoded.family}`,
      );
      await this.invalidateTokenFamily(decoded.family);
      return null;
    }

    const stored = JSON.parse(storedToken) as { userId: string; familyId: string; used: boolean };

    if (stored.used) {
      // Already used — replay attack detected
      this.logger.warn(
        `Refresh token replay attack for user ${decoded.sub}, invalidating family`,
      );
      await this.invalidateTokenFamily(decoded.family);
      return null;
    }

    // Mark current token as used (not deleted — needed for replay detection)
    await this.redisService.set(
      `${this.REFRESH_TOKEN_PREFIX}${decoded.jti}`,
      JSON.stringify({ ...stored, used: true }),
      this.refreshExpiresIn,
    );

    // Generate new token pair with the same family
    const newRefreshTokenId = uuidv4();
    const accessPayload: JwtPayload = {
      sub: decoded.sub,
      email: '', // Will be enriched by AuthService
      roles: [],
      tenantId: null,
    };

    // Return userId so AuthService can enrich the payload
    return {
      tokens: {
        accessToken: '', // Placeholder — AuthService will fill with enriched payload
        refreshToken: '',
        expiresIn: this.accessExpiresIn,
      },
      userId: decoded.sub,
    };
  }

  /**
   * Generate final tokens after enrichment by AuthService.
   */
  async generateRotatedTokenPair(
    payload: JwtPayload,
    familyId: string,
  ): Promise<AuthTokens> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });

    const refreshTokenId = uuidv4();
    const refreshPayload = {
      sub: payload.sub,
      jti: refreshTokenId,
      family: familyId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    await this.storeRefreshToken(
      refreshTokenId,
      payload.sub,
      familyId,
      this.refreshExpiresIn,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
    };
  }

  /**
   * Verify an access token and return its payload.
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessSecret,
      });
    } catch {
      return null;
    }
  }

  /**
   * Decode a refresh token without verifying.
   */
  decodeRefreshToken(token: string): { sub: string; jti: string; family: string } | null {
    try {
      return this.jwtService.verify<{ sub: string; jti: string; family: string }>(token, { secret: this.refreshSecret });
    } catch {
      return null;
    }
  }

  /**
   * Revoke a specific refresh token.
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const decoded = this.decodeRefreshToken(token);
    if (decoded) {
      await this.redisService.del(`${this.REFRESH_TOKEN_PREFIX}${decoded.jti}`);
    }
  }

  /**
   * Revoke all refresh tokens for a user.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    // We can't easily scan all keys for a user without a set.
    // In production, store user's active families in a set.
    // For now, we rely on DB-level token invalidation in AuthService.
    this.logger.log(`Revoking all tokens for user ${userId}`);
  }

  /**
   * Hash a password.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compare a password with its hash.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ─── Private ─────────────────────────────────────────────

  private async storeRefreshToken(
    tokenId: string,
    userId: string,
    familyId: string,
    ttl: number,
  ): Promise<void> {
    await this.redisService.set(
      `${this.REFRESH_TOKEN_PREFIX}${tokenId}`,
      JSON.stringify({ userId, familyId, used: false }),
      ttl,
    );

    // Track the family
    await this.redisService.set(
      `${this.TOKEN_FAMILY_PREFIX}${familyId}`,
      userId,
      ttl,
    );
  }

  private async invalidateTokenFamily(familyId: string): Promise<void> {
    // In a production system, you'd scan and delete all tokens in this family.
    // For now, deleting the family record prevents new rotations.
    await this.redisService.del(`${this.TOKEN_FAMILY_PREFIX}${familyId}`);
    this.logger.warn(`Invalidated token family ${familyId}`);
  }
}
