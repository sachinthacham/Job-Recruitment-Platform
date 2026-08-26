import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../common/services/prisma.service';
import { ApplicationStatus, OfferStatus } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    recruiterProfile: { findUnique: jest.Mock; count: jest.Mock };
    job: { count: jest.Mock; findMany: jest.Mock };
    application: { groupBy: jest.Mock; count: jest.Mock };
    offer: { groupBy: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    interview: { count: jest.Mock };
    user: { count: jest.Mock };
    candidateProfile: { count: jest.Mock };
    company: { count: jest.Mock };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      recruiterProfile: { findUnique: jest.fn(), count: jest.fn() },
      job: { count: jest.fn(), findMany: jest.fn() },
      application: { groupBy: jest.fn(), count: jest.fn() },
      offer: { groupBy: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      interview: { count: jest.fn() },
      user: { count: jest.fn() },
      candidateProfile: { count: jest.fn() },
      company: { count: jest.fn() },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecruiterDashboard', () => {
    it('throws BadRequestException when a platform admin omits companyId', async () => {
      await expect(
        service.getRecruiterDashboard('admin-1', true, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when the recruiter has no company profile', async () => {
      prisma.recruiterProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.getRecruiterDashboard('recruiter-1', false, undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    it('assembles the dashboard for a recruiter scoped to their own company', async () => {
      prisma.recruiterProfile.findUnique.mockResolvedValue({
        companyId: 'company-1',
      });
      prisma.job.count.mockResolvedValueOnce(10).mockResolvedValueOnce(6);
      prisma.application.groupBy.mockResolvedValue([
        { status: ApplicationStatus.APPLIED, _count: 4 },
        { status: ApplicationStatus.HIRED, _count: 2 },
      ]);
      prisma.offer.groupBy.mockResolvedValue([
        { status: OfferStatus.SENT, _count: 3 },
      ]);
      prisma.interview.count.mockResolvedValue(5);
      prisma.application.count.mockResolvedValue(2);
      prisma.job.findMany.mockResolvedValue([
        { id: 'job-1', title: 'Engineer', _count: { applications: 4 } },
      ]);
      prisma.offer.findMany.mockResolvedValue([
        {
          respondedAt: new Date('2026-01-11T00:00:00.000Z'),
          application: { appliedAt: new Date('2026-01-01T00:00:00.000Z') },
        },
      ]);

      const result = await service.getRecruiterDashboard(
        'recruiter-1',
        false,
        undefined,
      );

      expect(result).toEqual({
        totalJobs: 10,
        activeJobs: 6,
        applicationsByStatus: { APPLIED: 4, HIRED: 2 },
        offersByStatus: { SENT: 3 },
        upcomingInterviews: 5,
        hires: 2,
        averageTimeToHireDays: 10,
        topJobsByApplications: [
          { id: 'job-1', title: 'Engineer', applicationCount: 4 },
        ],
      });
    });
  });

  describe('getCandidateDashboard', () => {
    it('sums the status breakdown into a total', async () => {
      prisma.application.groupBy.mockResolvedValue([
        { status: ApplicationStatus.APPLIED, _count: 2 },
        { status: ApplicationStatus.INTERVIEW, _count: 1 },
      ]);
      prisma.interview.count.mockResolvedValue(1);
      prisma.offer.count.mockResolvedValue(1);

      const result = await service.getCandidateDashboard('candidate-1');

      expect(result).toEqual({
        totalApplications: 3,
        applicationsByStatus: { APPLIED: 2, INTERVIEW: 1 },
        upcomingInterviews: 1,
        activeOffers: 1,
      });
    });
  });

  describe('getPlatformDashboard', () => {
    it('assembles platform-wide totals', async () => {
      prisma.user.count.mockResolvedValue(100);
      prisma.candidateProfile.count.mockResolvedValue(70);
      prisma.recruiterProfile.count.mockResolvedValue(20);
      prisma.company.count.mockResolvedValue(15);
      prisma.job.count.mockResolvedValueOnce(50).mockResolvedValueOnce(30);
      prisma.application.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(40);
      prisma.$queryRaw.mockResolvedValue([
        { day: new Date('2026-08-01T00:00:00.000Z'), count: BigInt(5) },
      ]);

      const result = await service.getPlatformDashboard();

      expect(result).toEqual({
        totalUsers: 100,
        totalCandidates: 70,
        totalRecruiters: 20,
        totalCompanies: 15,
        totalJobs: 50,
        activeJobs: 30,
        totalApplications: 200,
        totalHires: 40,
        applicationsPerDay: [
          { day: new Date('2026-08-01T00:00:00.000Z'), count: 5 },
        ],
      });
    });
  });
});
