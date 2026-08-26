import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get a user's full profile including roles and related data.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        tenantId: true,
        createdAt: true,
        userRoles: {
          select: {
            role: {
              select: { name: true, description: true },
            },
          },
        },
        candidateProfile: {
          select: {
            headline: true,
            bio: true,
            location: true,
            phone: true,
            linkedinUrl: true,
            githubUrl: true,
            website: true,
            salaryExpectationMin: true,
            salaryExpectationMax: true,
            salaryCurrency: true,
            remotePreference: true,
            profileCompleteness: true,
          },
        },
        recruiterProfile: {
          select: {
            title: true,
            phone: true,
            bio: true,
            companyId: true,
            company: {
              select: { name: true, slug: true, logoUrl: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.userRoles.map((ur) => ur.role.name),
      userRoles: undefined, // Remove the raw relation
    };
  }

  /**
   * Update basic profile information.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    return updated;
  }

  /**
   * Find a user by ID (admin).
   */
  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        tenantId: true,
        userRoles: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.userRoles.map((ur) => ur.role.name),
      userRoles: undefined,
    };
  }
}
