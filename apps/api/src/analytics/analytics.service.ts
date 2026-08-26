import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  ApplicationStatus,
  InterviewStatus,
  OfferStatus,
} from '@prisma/client';

const UPCOMING_INTERVIEW_STATUSES: InterviewStatus[] = [
  InterviewStatus.SCHEDULED,
  InterviewStatus.CONFIRMED,
  InterviewStatus.RESCHEDULED,
];

const ACTIVE_OFFER_STATUSES: OfferStatus[] = [
  OfferStatus.SENT,
  OfferStatus.VIEWED,
];

function toStatusCounts<T extends string>(
  groups: { status: T; _count: number }[],
): Record<string, number> {
  return groups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count;
    return acc;
  }, {});
}

function averageDays(pairs: { from: Date; to: Date }[]): number | null {
  if (pairs.length === 0) {
    return null;
  }

  const totalMs = pairs.reduce(
    (sum, { from, to }) => sum + (to.getTime() - from.getTime()),
    0,
  );

  return Math.round((totalMs / pairs.length / (1000 * 60 * 60 * 24)) * 10) / 10;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCompanyId(
    userId: string,
    isPlatformAdmin: boolean,
    companyId?: string,
  ): Promise<string> {
    if (isPlatformAdmin) {
      if (!companyId) {
        throw new BadRequestException(
          'companyId is required for platform admins',
        );
      }

      return companyId;
    }

    const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiterProfile) {
      throw new ForbiddenException(
        'You must be associated with a company to view this dashboard',
      );
    }

    return recruiterProfile.companyId;
  }

  async getRecruiterDashboard(
    userId: string,
    isPlatformAdmin: boolean,
    requestedCompanyId?: string,
  ) {
    const companyId = await this.resolveCompanyId(
      userId,
      isPlatformAdmin,
      requestedCompanyId,
    );

    const [
      totalJobs,
      activeJobs,
      applicationStatusGroups,
      offerStatusGroups,
      upcomingInterviews,
      hires,
      topJobs,
      acceptedOffers,
    ] = await Promise.all([
      this.prisma.job.count({ where: { companyId, deletedAt: null } }),
      this.prisma.job.count({
        where: { companyId, deletedAt: null, status: 'PUBLISHED' },
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { job: { companyId } },
        _count: true,
      }),
      this.prisma.offer.groupBy({
        by: ['status'],
        where: { application: { job: { companyId } } },
        _count: true,
      }),
      this.prisma.interview.count({
        where: {
          application: { job: { companyId } },
          scheduledAt: { gte: new Date() },
          status: { in: UPCOMING_INTERVIEW_STATUSES },
        },
      }),
      this.prisma.application.count({
        where: { job: { companyId }, status: ApplicationStatus.HIRED },
      }),
      this.prisma.job.findMany({
        where: { companyId, deletedAt: null },
        select: {
          id: true,
          title: true,
          _count: { select: { applications: true } },
        },
        orderBy: { applications: { _count: 'desc' } },
        take: 5,
      }),
      this.prisma.offer.findMany({
        where: {
          application: { job: { companyId } },
          status: OfferStatus.ACCEPTED,
          respondedAt: { not: null },
        },
        select: {
          respondedAt: true,
          application: { select: { appliedAt: true } },
        },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      applicationsByStatus: toStatusCounts(
        applicationStatusGroups as { status: string; _count: number }[],
      ),
      offersByStatus: toStatusCounts(
        offerStatusGroups as { status: string; _count: number }[],
      ),
      upcomingInterviews,
      hires,
      averageTimeToHireDays: averageDays(
        acceptedOffers.map((offer) => ({
          from: offer.application.appliedAt,
          to: offer.respondedAt as Date,
        })),
      ),
      topJobsByApplications: topJobs.map((job) => ({
        id: job.id,
        title: job.title,
        applicationCount: job._count.applications,
      })),
    };
  }

  async getCandidateDashboard(candidateId: string) {
    const [applicationStatusGroups, upcomingInterviews, activeOffers] =
      await Promise.all([
        this.prisma.application.groupBy({
          by: ['status'],
          where: { candidateId },
          _count: true,
        }),
        this.prisma.interview.count({
          where: {
            application: { candidateId },
            scheduledAt: { gte: new Date() },
            status: { in: UPCOMING_INTERVIEW_STATUSES },
          },
        }),
        this.prisma.offer.count({
          where: { candidateId, status: { in: ACTIVE_OFFER_STATUSES } },
        }),
      ]);

    const applicationsByStatus = toStatusCounts(
      applicationStatusGroups as { status: string; _count: number }[],
    );
    const totalApplications = Object.values(applicationsByStatus).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      totalApplications,
      applicationsByStatus,
      upcomingInterviews,
      activeOffers,
    };
  }

  async getPlatformDashboard() {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalHires,
      applicationsPerDay,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.candidateProfile.count(),
      this.prisma.recruiterProfile.count(),
      this.prisma.company.count(),
      this.prisma.job.count({ where: { deletedAt: null } }),
      this.prisma.job.count({
        where: { deletedAt: null, status: 'PUBLISHED' },
      }),
      this.prisma.application.count(),
      this.prisma.application.count({
        where: { status: ApplicationStatus.HIRED },
      }),
      this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', applied_at) AS day, COUNT(*)::bigint AS count
        FROM applications
        WHERE applied_at >= NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalHires,
      applicationsPerDay: applicationsPerDay.map((row) => ({
        day: row.day,
        count: Number(row.count),
      })),
    };
  }
}
