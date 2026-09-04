import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Currency, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { SubscribeDto, PaymentFilterDto } from './dto/subscription.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PLAN_CATALOG } from './plan-catalog';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-action.enum';

const OPEN_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.PAST_DUE,
];

const BILLING_PERIOD_DAYS = 30;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private resolveTenantId(
    userTenantId: string | null,
    isPlatformAdmin: boolean,
    requestedTenantId?: string,
  ): string {
    if (isPlatformAdmin) {
      if (!requestedTenantId) {
        throw new BadRequestException(
          'tenantId is required for platform admins',
        );
      }

      return requestedTenantId;
    }

    if (!userTenantId) {
      throw new ForbiddenException(
        'Your account is not associated with a tenant',
      );
    }

    return userTenantId;
  }

  getPlans() {
    return Object.values(PLAN_CATALOG);
  }

  /** Resolves the plan currently active for a tenant, defaulting to FREE. */
  async getActivePlan(tenantId: string): Promise<SubscriptionPlan> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: OPEN_SUBSCRIPTION_STATUSES } },
      orderBy: { createdAt: 'desc' },
    });

    return subscription?.plan ?? SubscriptionPlan.FREE;
  }

  async getCurrent(
    userTenantId: string | null,
    isPlatformAdmin: boolean,
    requestedTenantId?: string,
  ) {
    const tenantId = this.resolveTenantId(
      userTenantId,
      isPlatformAdmin,
      requestedTenantId,
    );

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        tenantId,
        plan: SubscriptionPlan.FREE,
        status: null,
        isDefault: true,
      };
    }

    return subscription;
  }

  async subscribe(
    userId: string,
    userTenantId: string | null,
    isPlatformAdmin: boolean,
    dto: SubscribeDto,
  ) {
    const tenantId = this.resolveTenantId(
      userTenantId,
      isPlatformAdmin,
      dto.tenantId,
    );

    const existing = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: OPEN_SUBSCRIPTION_STATUSES } },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const currentPeriodEnd = addDays(now, BILLING_PERIOD_DAYS);
    const planDetails = PLAN_CATALOG[dto.plan];

    const subscription = await this.prisma.$transaction(async (tx) => {
      const subscription = existing
        ? await tx.subscription.update({
            where: { id: existing.id },
            data: {
              plan: dto.plan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd,
            },
          })
        : await tx.subscription.create({
            data: {
              tenantId,
              plan: dto.plan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd,
            },
          });

      if (planDetails.priceUsd > 0) {
        await tx.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: planDetails.priceUsd * 100,
            currency: Currency.USD,
            status: 'COMPLETED',
            paidAt: now,
          },
        });
      }

      return subscription;
    });

    await this.audit.log({
      userId,
      tenantId,
      action: existing
        ? AuditAction.SUBSCRIPTION_UPDATED
        : AuditAction.SUBSCRIPTION_CREATED,
      entityType: 'Subscription',
      entityId: subscription.id,
      newValue: { plan: subscription.plan, status: subscription.status },
    });

    return subscription;
  }

  async cancel(
    userId: string,
    userTenantId: string | null,
    isPlatformAdmin: boolean,
    requestedTenantId?: string,
  ) {
    const tenantId = this.resolveTenantId(
      userTenantId,
      isPlatformAdmin,
      requestedTenantId,
    );

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: OPEN_SUBSCRIPTION_STATUSES } },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription to cancel');
    }

    const cancelled = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    });

    await this.audit.log({
      userId,
      tenantId,
      action: AuditAction.SUBSCRIPTION_CANCELLED,
      entityType: 'Subscription',
      entityId: subscription.id,
      previousValue: { plan: subscription.plan },
    });

    return cancelled;
  }

  async listPayments(
    userTenantId: string | null,
    isPlatformAdmin: boolean,
    filterDto: PaymentFilterDto,
  ) {
    const tenantId = this.resolveTenantId(
      userTenantId,
      isPlatformAdmin,
      filterDto.tenantId,
    );

    const where = { subscription: { tenantId } };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }
}
