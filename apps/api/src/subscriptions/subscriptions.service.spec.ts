import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../common/services/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: {
    subscription: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    payment: {
      create: jest.Mock<
        Promise<{ id: string }>,
        [{ data: { subscriptionId: string; amount: number } }]
      >;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      subscription: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      payment: {
        create: jest.fn<
          Promise<{ id: string }>,
          [{ data: { subscriptionId: string; amount: number } }]
        >(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        cb({
          subscription: prisma.subscription,
          payment: prisma.payment,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrent', () => {
    it('throws BadRequestException when a platform admin omits tenantId', async () => {
      await expect(service.getCurrent(null, true, undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ForbiddenException when a non-admin has no tenant', async () => {
      await expect(service.getCurrent(null, false, undefined)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns a synthesized FREE plan when no subscription row exists', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getCurrent('tenant-1', false, undefined);

      expect(result).toEqual({
        tenantId: 'tenant-1',
        plan: SubscriptionPlan.FREE,
        status: null,
        isDefault: true,
      });
    });

    it('returns the existing subscription when one exists', async () => {
      prisma.subscription.findFirst.mockResolvedValue({ id: 'sub-1' });

      const result = await service.getCurrent('tenant-1', false, undefined);

      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('subscribe', () => {
    it('creates a payment when upgrading to a paid plan with no existing subscription', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.subscription.create.mockResolvedValue({
        id: 'sub-1',
        plan: SubscriptionPlan.STARTER,
      });

      const result = await service.subscribe('user-1', 'tenant-1', false, {
        plan: SubscriptionPlan.STARTER,
      });

      expect(result).toEqual({ id: 'sub-1', plan: SubscriptionPlan.STARTER });
      const [paymentCall] = prisma.payment.create.mock.calls[0];
      expect(paymentCall.data.subscriptionId).toBe('sub-1');
      expect(paymentCall.data.amount).toBe(4900);
    });

    it('does not create a payment when downgrading to FREE', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.subscription.create.mockResolvedValue({
        id: 'sub-1',
        plan: SubscriptionPlan.FREE,
      });

      await service.subscribe('user-1', 'tenant-1', false, {
        plan: SubscriptionPlan.FREE,
      });

      expect(prisma.payment.create).not.toHaveBeenCalled();
    });

    it('updates the existing subscription instead of creating a new one', async () => {
      prisma.subscription.findFirst.mockResolvedValue({ id: 'sub-1' });
      prisma.subscription.update.mockResolvedValue({
        id: 'sub-1',
        plan: SubscriptionPlan.PROFESSIONAL,
      });

      await service.subscribe('user-1', 'tenant-1', false, {
        plan: SubscriptionPlan.PROFESSIONAL,
      });

      expect(prisma.subscription.create).not.toHaveBeenCalled();
      expect(prisma.subscription.update).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('throws NotFoundException when there is no active subscription', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);

      await expect(
        service.cancel('user-1', 'tenant-1', false, undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('cancels the active subscription', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.ACTIVE,
      });
      prisma.subscription.update.mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.CANCELLED,
      });

      const result = await service.cancel(
        'user-1',
        'tenant-1',
        false,
        undefined,
      );

      expect(result).toEqual({
        id: 'sub-1',
        status: SubscriptionStatus.CANCELLED,
      });
    });
  });

  describe('getPlans', () => {
    it('returns all four plan tiers', () => {
      const plans = service.getPlans();

      expect(plans).toHaveLength(4);
      expect(plans.map((p) => p.plan)).toEqual(
        expect.arrayContaining([
          SubscriptionPlan.FREE,
          SubscriptionPlan.STARTER,
          SubscriptionPlan.PROFESSIONAL,
          SubscriptionPlan.ENTERPRISE,
        ]),
      );
    });
  });
});
