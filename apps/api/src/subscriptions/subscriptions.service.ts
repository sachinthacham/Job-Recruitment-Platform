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
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async cancel(
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

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    });
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
