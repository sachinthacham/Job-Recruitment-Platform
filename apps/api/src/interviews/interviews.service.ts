import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { ApplicationStatus, InterviewStatus } from '@prisma/client';
import {
  ScheduleInterviewDto,
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  InterviewFilterDto,
  SubmitInterviewFeedbackDto,
} from './dto/interview.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

const TERMINAL_STATUSES: InterviewStatus[] = [
  InterviewStatus.COMPLETED,
  InterviewStatus.CANCELLED,
  InterviewStatus.NO_SHOW,
];

const NON_TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
];

const INTERVIEW_INCLUDE = {
  participants: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  application: {
    select: {
      id: true,
      candidateId: true,
      job: { select: { id: true, title: true, companyId: true } },
    },
  },
};

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

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
        "You do not have access to this company's interviews",
      );
    }
  }

  private async findInterviewOrThrow(tenantId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, application: { job: { tenantId } } },
      include: INTERVIEW_INCLUDE,
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async schedule(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    dto: ScheduleInterviewDto,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: dto.applicationId, job: { tenantId } },
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

    const interviewerIds = [...new Set(dto.interviewerIds)].filter(
      (id) => id !== application.candidateId,
    );

    return this.prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({
        data: {
          applicationId: dto.applicationId,
          type: dto.type,
          title: dto.title,
          scheduledAt: new Date(dto.scheduledAt),
          duration: dto.duration,
          location: dto.location,
          meetingUrl: dto.meetingUrl,
          notes: dto.notes,
        },
      });

      await tx.interviewParticipant.createMany({
        data: [
          ...interviewerIds.map((interviewerId) => ({
            interviewId: interview.id,
            userId: interviewerId,
            role: 'INTERVIEWER',
          })),
          {
            interviewId: interview.id,
            userId: application.candidateId,
            role: 'CANDIDATE',
          },
        ],
      });

      if (NON_TERMINAL_APPLICATION_STATUSES.includes(application.status)) {
        await tx.application.update({
          where: { id: application.id },
          data: { status: ApplicationStatus.INTERVIEW },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: application.id,
            previousStatus: application.status,
            newStatus: ApplicationStatus.INTERVIEW,
            changedById: userId,
            notes: 'Interview scheduled',
          },
        });
      }

      return interview;
    });
  }

  async findMyInterviews(
    tenantId: string,
    candidateId: string,
    filterDto: InterviewFilterDto,
  ) {
    const where = {
      application: { candidateId, job: { tenantId } },
      ...(filterDto.status && { status: filterDto.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: INTERVIEW_INCLUDE,
        orderBy: { scheduledAt: filterDto.sortOrder ?? 'asc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async findByApplication(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    applicationId: string,
    filterDto: InterviewFilterDto,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, job: { tenantId } },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isOwner = application.candidateId === userId;

    if (!isOwner && !isPlatformAdmin) {
      await this.assertCompanyAccess(userId, false, application.job.companyId);
    }

    const where = {
      applicationId,
      ...(filterDto.status && { status: filterDto.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: INTERVIEW_INCLUDE,
        orderBy: { scheduledAt: filterDto.sortOrder ?? 'asc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async findOne(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
  ) {
    const interview = await this.findInterviewOrThrow(tenantId, interviewId);
    const isOwner = interview.application.candidateId === userId;

    if (!isOwner && !isPlatformAdmin) {
      await this.assertCompanyAccess(
        userId,
        false,
        interview.application.job.companyId,
      );
    }

    return interview;
  }

  async update(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
    dto: UpdateInterviewDto,
  ) {
    const interview = await this.findInterviewOrThrow(tenantId, interviewId);

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      interview.application.job.companyId,
    );

    if (TERMINAL_STATUSES.includes(interview.status)) {
      throw new BadRequestException(
        `Cannot modify a ${interview.status.toLowerCase()} interview`,
      );
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: INTERVIEW_INCLUDE,
    });
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
    dto: UpdateInterviewStatusDto,
  ) {
    const interview = await this.findInterviewOrThrow(tenantId, interviewId);

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      interview.application.job.companyId,
    );

    if (TERMINAL_STATUSES.includes(interview.status)) {
      throw new BadRequestException(
        `Cannot change status of a ${interview.status.toLowerCase()} interview`,
      );
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: dto.status },
      include: INTERVIEW_INCLUDE,
    });
  }

  async cancel(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
  ) {
    return this.updateStatus(tenantId, userId, isPlatformAdmin, interviewId, {
      status: InterviewStatus.CANCELLED,
    });
  }

  async submitFeedback(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
    dto: SubmitInterviewFeedbackDto,
  ) {
    const interview = await this.findInterviewOrThrow(tenantId, interviewId);

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      interview.application.job.companyId,
    );

    const existing = await this.prisma.interviewFeedback.findUnique({
      where: { interviewId_reviewerId: { interviewId, reviewerId: userId } },
    });

    if (existing) {
      throw new ConflictException(
        'You have already submitted feedback for this interview',
      );
    }

    return this.prisma.interviewFeedback.create({
      data: { ...dto, interviewId, reviewerId: userId },
    });
  }

  async findFeedback(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    interviewId: string,
  ) {
    const interview = await this.findInterviewOrThrow(tenantId, interviewId);

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      interview.application.job.companyId,
    );

    return this.prisma.interviewFeedback.findMany({
      where: { interviewId },
      include: {
        reviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
