import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../common/services/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplicationStatus, JobStatus } from '@prisma/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: {
    job: { findFirst: jest.Mock };
    application: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    recruiterProfile: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      job: { findFirst: jest.fn() },
      application: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      recruiterProfile: { findUnique: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        cb({
          application: {
            create: jest.fn().mockResolvedValue({ id: 'app-1' }),
            update: jest.fn().mockResolvedValue({ id: 'app-1' }),
          },
          applicationStatusHistory: { create: jest.fn() },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply', () => {
    it('throws NotFoundException when the job does not exist or is not published', async () => {
      prisma.job.findFirst.mockResolvedValue(null);

      await expect(
        service.apply('candidate-1', { jobId: 'job-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when the candidate already applied', async () => {
      prisma.job.findFirst.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PUBLISHED,
      });
      prisma.application.findUnique.mockResolvedValue({ id: 'existing-app' });

      await expect(
        service.apply('candidate-1', { jobId: 'job-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates the application when the job exists and no prior application exists', async () => {
      prisma.job.findFirst.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PUBLISHED,
      });
      prisma.application.findUnique.mockResolvedValue(null);

      const result = await service.apply('candidate-1', {
        jobId: 'job-1',
      });

      expect(result).toEqual({ id: 'app-1' });
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when the application is not in this tenant', async () => {
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('recruiter-1', false, 'app-1', {
          status: ApplicationStatus.SHORTLISTED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the recruiter is not part of the job company', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.APPLIED,
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-2',
      });

      await expect(
        service.updateStatus('recruiter-1', false, 'app-1', {
          status: ApplicationStatus.SHORTLISTED,
        }),
      ).rejects.toThrow('access to this company');
    });

    it('throws BadRequestException when the application is already in a terminal status', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.REJECTED,
        job: { companyId: 'company-1' },
      });
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });

      await expect(
        service.updateStatus('recruiter-1', false, 'app-1', {
          status: ApplicationStatus.SHORTLISTED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdraw', () => {
    it('throws NotFoundException when the application does not belong to the candidate', async () => {
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(service.withdraw('candidate-1', 'app-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the application is already finalized', async () => {
      prisma.application.findFirst.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.HIRED,
      });

      await expect(service.withdraw('candidate-1', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
