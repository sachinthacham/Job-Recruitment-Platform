import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { PrismaService } from '../common/services/prisma.service';
import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  InterviewRecommendation,
} from '@prisma/client';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let prisma: {
    application: { findFirst: jest.Mock };
    interview: { findFirst: jest.Mock; update: jest.Mock };
    interviewFeedback: { findUnique: jest.Mock; create: jest.Mock };
    recruiterProfile: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      application: { findFirst: jest.fn() },
      interview: { findFirst: jest.fn(), update: jest.fn() },
      interviewFeedback: { findUnique: jest.fn(), create: jest.fn() },
      recruiterProfile: { findUnique: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        cb({
          interview: {
            create: jest.fn().mockResolvedValue({ id: 'interview-1' }),
          },
          interviewParticipant: { createMany: jest.fn() },
          application: { update: jest.fn() },
          applicationStatusHistory: { create: jest.fn() },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('schedule', () => {
    const dto = {
      applicationId: 'app-1',
      type: InterviewType.VIDEO,
      title: 'Technical Screen',
      scheduledAt: '2026-09-01T10:00:00.000Z',
      duration: 45,
      interviewerIds: ['interviewer-1'],
    };

    it('throws NotFoundException when the application does not exist in this tenant', async () => {
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(
        service.schedule('tenant-1', 'recruiter-1', false, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the recruiter is not part of the job company', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        candidateId: 'candidate-1',
        status: ApplicationStatus.APPLIED,
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-2',
      });

      await expect(
        service.schedule('tenant-1', 'recruiter-1', false, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates the interview when the application exists and access is granted', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        candidateId: 'candidate-1',
        status: ApplicationStatus.APPLIED,
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });

      const result = await service.schedule(
        'tenant-1',
        'recruiter-1',
        false,
        dto,
      );

      expect(result).toEqual({ id: 'interview-1' });
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when the interview is not in this tenant', async () => {
      prisma.interview.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('tenant-1', 'recruiter-1', false, 'interview-1', {
          status: InterviewStatus.CONFIRMED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when the interview is already in a terminal status', async () => {
      prisma.interview.findFirst.mockResolvedValue({
        id: 'interview-1',
        status: InterviewStatus.CANCELLED,
        application: {
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });

      await expect(
        service.updateStatus('tenant-1', 'recruiter-1', false, 'interview-1', {
          status: InterviewStatus.COMPLETED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitFeedback', () => {
    const dto = {
      overallRating: 4,
      recommendation: InterviewRecommendation.HIRE,
    };

    it('throws ConflictException when the reviewer already submitted feedback', async () => {
      prisma.interview.findFirst.mockResolvedValue({
        id: 'interview-1',
        status: InterviewStatus.COMPLETED,
        application: {
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });
      prisma.interviewFeedback.findUnique.mockResolvedValue({ id: 'fb-1' });

      await expect(
        service.submitFeedback(
          'tenant-1',
          'recruiter-1',
          false,
          'interview-1',
          dto,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('creates feedback when none exists yet', async () => {
      prisma.interview.findFirst.mockResolvedValue({
        id: 'interview-1',
        status: InterviewStatus.COMPLETED,
        application: {
          candidateId: 'candidate-1',
          job: { companyId: 'company-1' },
        },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });
      prisma.interviewFeedback.findUnique.mockResolvedValue(null);
      prisma.interviewFeedback.create.mockResolvedValue({ id: 'fb-1' });

      const result = await service.submitFeedback(
        'tenant-1',
        'recruiter-1',
        false,
        'interview-1',
        dto,
      );

      expect(result).toEqual({ id: 'fb-1' });
    });
  });
});
