import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { AuditAction } from './audit-action.enum';

export interface AuditLogParams {
  userId?: string | null;
  tenantId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}

/** Append-only audit trail. Failures here must never block the caller's main operation. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        tenantId: params.tenantId ?? undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        previousValue: params.previousValue as
          Prisma.InputJsonValue | undefined,
        newValue: params.newValue as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findMany(
    where: Prisma.AuditLogWhereInput,
    page: number,
    perPage: number,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}
