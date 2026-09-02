import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { PrismaService } from '../common/services/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { Currency, OfferStatus } from '@prisma/client';
import { OfferResponseDecision } from './dto/offer.dto';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: {
    application: { findFirst: jest.Mock; update: jest.Mock };
    offer: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    recruiterProfile: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      application: { findFirst: jest.fn(), update: jest.fn() },
      offer: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      recruiterProfile: { findUnique: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        cb({
          offer: {
            update: jest.fn().mockResolvedValue({ id: 'offer-1' }),
          },
          application: { update: jest.fn() },
          applicationStatusHistory: { create: jest.fn() },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      applicationId: 'app-1',
      salary: 100000,
      currency: Currency.USD,
      startDate: '2026-10-01T00:00:00.000Z',
      employmentType: 'FULL_TIME' as const,
      expirationDate: '2026-09-10T00:00:00.000Z',
    };

    it('throws NotFoundException when the application does not exist in this tenant', async () => {
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(service.create('recruiter-1', false, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the recruiter is not part of the job company', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        candidateId: 'candidate-1',
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-2',
      });

      await expect(service.create('recruiter-1', false, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ConflictException when an offer already exists for the application', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        candidateId: 'candidate-1',
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });
      prisma.offer.findUnique.mockResolvedValue({ id: 'existing-offer' });

      await expect(service.create('recruiter-1', false, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates a draft offer when none exists yet', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        candidateId: 'candidate-1',
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });
      prisma.offer.findUnique.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue({ id: 'offer-1' });

      const result = await service.create('recruiter-1', false, dto);

      expect(result).toEqual({ id: 'offer-1' });
    });
  });

  describe('send', () => {
    it('throws BadRequestException when the offer is not a draft', async () => {
      prisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        status: OfferStatus.SENT,
        application: {
          id: 'app-1',
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });

      await expect(
        service.send('recruiter-1', false, 'offer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends a draft offer and moves the application to OFFERED', async () => {
      prisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        status: OfferStatus.DRAFT,
        application: {
          id: 'app-1',
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });

      const result = await service.send('recruiter-1', false, 'offer-1');

      expect(result).toEqual({ id: 'offer-1' });
    });
  });

  describe('respond', () => {
    it('throws NotFoundException when the offer does not belong to the candidate', async () => {
      prisma.offer.findFirst.mockResolvedValue(null);

      await expect(
        service.respond('candidate-1', 'offer-1', {
          decision: OfferResponseDecision.ACCEPTED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when the offer is not awaiting a response', async () => {
      prisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        status: OfferStatus.ACCEPTED,
        expirationDate: new Date(Date.now() + 86400000),
        application: {
          id: 'app-1',
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });

      await expect(
        service.respond('candidate-1', 'offer-1', {
          decision: OfferResponseDecision.ACCEPTED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the offer has lapsed', async () => {
      prisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        status: OfferStatus.SENT,
        expirationDate: new Date(Date.now() - 86400000),
        application: {
          id: 'app-1',
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.offer.update.mockResolvedValue({});

      await expect(
        service.respond('candidate-1', 'offer-1', {
          decision: OfferResponseDecision.ACCEPTED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts an active offer and hires the candidate', async () => {
      prisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        status: OfferStatus.VIEWED,
        expirationDate: new Date(Date.now() + 86400000),
        application: {
          id: 'app-1',
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });

      const result = await service.respond('candidate-1', 'offer-1', {
        decision: OfferResponseDecision.ACCEPTED,
      });

      expect(result).toEqual({ id: 'offer-1' });
    });
  });
});
