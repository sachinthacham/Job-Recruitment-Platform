import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, AccountStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-action.enum';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  AdminUserFilterDto,
  AdminCompanyFilterDto,
  AuditLogFilterDto,
} from './dto/admin.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly analytics: AnalyticsService,
  ) {}

  async listUsers(filterDto: AdminUserFilterDto) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(filterDto.status && { status: filterDto.status }),
      ...(filterDto.role && {
        userRoles: { some: { role: { name: filterDto.role } } },
      }),
      ...(filterDto.search && {
        OR: [
          { email: { contains: filterDto.search, mode: 'insensitive' } },
          { firstName: { contains: filterDto.search, mode: 'insensitive' } },
          { lastName: { contains: filterDto.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          tenantId: true,
          createdAt: true,
          userRoles: { select: { role: { select: { name: true } } } },
        },
        orderBy: { createdAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.user.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data.map((user) => ({
        ...user,
        roles: user.userRoles.map((ur) => ur.role.name),
        userRoles: undefined,
      })),
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async updateUserStatus(
    adminUserId: string,
    userId: string,
    status: AccountStatus,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    await this.audit.log({
      userId: adminUserId,
      tenantId: user.tenantId,
      action:
        status === AccountStatus.SUSPENDED
          ? AuditAction.USER_SUSPENDED
          : AuditAction.USER_ACTIVATED,
      entityType: 'User',
      entityId: userId,
      previousValue: { status: user.status },
      newValue: { status },
    });

    return updated;
  }

  async listCompanies(filterDto: AdminCompanyFilterDto) {
    const where: Prisma.CompanyWhereInput = {
      deletedAt: null,
      ...(filterDto.search && {
        name: { contains: filterDto.search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          industry: true,
          isVerified: true,
          tenantId: true,
          createdAt: true,
          tenant: { select: { name: true, isActive: true } },
          _count: { select: { jobs: true, recruiterProfiles: true } },
        },
        orderBy: { createdAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.company.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async listAuditLogs(filterDto: AuditLogFilterDto) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filterDto.userId && { userId: filterDto.userId }),
      ...(filterDto.tenantId && { tenantId: filterDto.tenantId }),
      ...(filterDto.entityType && { entityType: filterDto.entityType }),
      ...(filterDto.action && { action: filterDto.action }),
    };

    const { data, total } = await this.audit.findMany(
      where,
      filterDto.page,
      filterDto.perPage,
    );

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async getStats() {
    return this.analytics.getPlatformDashboard();
  }
}
