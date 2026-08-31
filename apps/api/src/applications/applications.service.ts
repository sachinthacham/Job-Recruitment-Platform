import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { ApplicationStatus, JobStatus, NotificationType } from '@prisma/client';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationFilterDto,
} from './dto/application.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';

const TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.HIRED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

const APPLICATION_INCLUDE = {
  job: {
    select: {
      id: true,
      title: true,
      slug: true,
      companyId: true,
      company: { select: { name: true, logoUrl: true } },
    },
  },
  candidate: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      candidateProfile: { select: { headline: true, location: true } },
    },
  },
  resume: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertCompanyAccess(
    userId: string,
    isPlatformAdmin: boolean,
    companyId: string,
  ): Promise<void> {
    if (isPlatformAdmin) {
      return;
    }

    const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiterProfile || recruiterProfile.companyId !== companyId) {
      throw new ForbiddenException(
        "You do not have access to this company's applications",
      );
    }
  }

  async apply(candidateId: string, dto: CreateApplicationDto) {
    // Candidates have no tenant of their own — this is a public job board,
    // so a job is only scoped by its own id/status, not the caller's tenant.
    const job = await this.prisma.job.findFirst({
      where: {
        id: dto.jobId,
        deletedAt: null,
        status: JobStatus.PUBLISHED,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: dto.jobId, candidateId } },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          jobId: dto.jobId,
          candidateId,
          coverLetter: dto.coverLetter,
          status: ApplicationStatus.APPLIED,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          previousStatus: null,
          newStatus: ApplicationStatus.APPLIED,
          changedById: candidateId,
        },
      });

      return created;
    });

    await this.notifications.create(
      job.createdById,
      NotificationType.APPLICATION_SUBMITTED,
      'New application received',
      `A candidate applied to "${job.title}"`,
      { applicationId: application.id, jobId: job.id },
    );

    return application;
  }

  async findMyApplications(
    candidateId: string,
    filterDto: ApplicationFilterDto,
  ) {
    const where = {
      candidateId,
      ...(filterDto.status && { status: filterDto.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: APPLICATION_INCLUDE,
        orderBy: { appliedAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.application.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async findJobApplications(
    userId: string,
    isPlatformAdmin: boolean,
    jobId: string,
    filterDto: ApplicationFilterDto,
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.assertCompanyAccess(userId, isPlatformAdmin, job.companyId);

    const where = {
      jobId,
      ...(filterDto.status && { status: filterDto.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: APPLICATION_INCLUDE,
        orderBy: { appliedAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.application.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async findOne(
    userId: string,
    isPlatformAdmin: boolean,
    applicationId: string,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId },
      include: APPLICATION_INCLUDE,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isOwner = application.candidateId === userId;

    if (!isOwner && !isPlatformAdmin) {
      await this.assertCompanyAccess(userId, false, application.job.companyId);
    }

    return application;
  }

  async updateStatus(
    userId: string,
    isPlatformAdmin: boolean,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      application.job.companyId,
    );

    if (TERMINAL_STATUSES.includes(application.status)) {
      throw new BadRequestException(
        `Cannot change status of a ${application.status.toLowerCase()} application`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.application.update({
        where: { id: applicationId },
        data: { status: dto.status },
        include: APPLICATION_INCLUDE,
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: application.status,
          newStatus: dto.status,
          changedById: userId,
          notes: dto.notes,
        },
      });

      return result;
    });

    const notificationType =
      dto.status === ApplicationStatus.SHORTLISTED
        ? NotificationType.CANDIDATE_SHORTLISTED
        : NotificationType.APPLICATION_STATUS_CHANGED;

    await this.notifications.create(
      application.candidateId,
      notificationType,
      'Application status updated',
      `Your application status changed to ${dto.status.replace(/_/g, ' ').toLowerCase()}`,
      { applicationId, status: dto.status },
    );

    return updated;
  }

  async withdraw(candidateId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, candidateId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (TERMINAL_STATUSES.includes(application.status)) {
      throw new BadRequestException('This application cannot be withdrawn');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.WITHDRAWN },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: application.status,
          newStatus: ApplicationStatus.WITHDRAWN,
          changedById: candidateId,
        },
      });

      return updated;
    });
  }
}
