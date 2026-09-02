import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from './dto/job.dto';
import {
  JobStatus,
  Prisma,
  ExperienceLevel,
  EmploymentType,
  RemoteType,
} from '@prisma/client';
import slugify from 'slugify';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PLAN_CATALOG } from '../subscriptions/plan-catalog';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-action.enum';

const NON_ACTIVE_JOB_STATUSES: JobStatus[] = [
  JobStatus.CLOSED,
  JobStatus.ARCHIVED,
];

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
    private readonly audit: AuditService,
  ) {}

  private generateSlug(title: string): string {
    return (
      slugify(title, { lower: true, strict: true }) +
      '-' +
      Math.random().toString(36).substring(2, 8)
    );
  }

  async create(tenantId: string, userId: string, createDto: CreateJobDto) {
    // Determine the company of the recruiter
    const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiterProfile?.companyId) {
      throw new ForbiddenException(
        'You must be associated with a company to post jobs',
      );
    }

    const plan = await this.subscriptions.getActivePlan(tenantId);
    const jobLimit = PLAN_CATALOG[plan].jobLimit;

    if (jobLimit !== null) {
      const activeJobCount = await this.prisma.job.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { notIn: NON_ACTIVE_JOB_STATUSES },
        },
      });

      if (activeJobCount >= jobLimit) {
        throw new ForbiddenException(
          `Your ${plan.toLowerCase()} plan allows up to ${jobLimit} active job postings. Upgrade your plan to post more.`,
        );
      }
    }

    const { skills, ...jobData } = createDto;
    const slug = this.generateSlug(jobData.title);

    const job = await this.prisma.$transaction(async (tx) => {
      const created = await tx.job.create({
        data: {
          ...jobData,
          experienceLevel: jobData.experienceLevel || ExperienceLevel.MID,
          employmentType: jobData.employmentType || EmploymentType.FULL_TIME,
          remoteType: jobData.remoteType || RemoteType.ON_SITE,
          slug,
          tenantId,
          companyId: recruiterProfile.companyId,
          createdById: userId,
          applicationDeadline: jobData.applicationDeadline
            ? new Date(jobData.applicationDeadline)
            : null,
          publishedAt:
            jobData.status === JobStatus.PUBLISHED ? new Date() : null,
        },
      });

      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          const name = skillName.trim().toLowerCase();
          let skillRecord = await tx.skill.findUnique({ where: { name } });
          if (!skillRecord) {
            skillRecord = await tx.skill.create({
              data: { name, isVerified: false },
            });
          }
          await tx.jobSkill.create({
            data: {
              jobId: created.id,
              skillId: skillRecord.id,
              isRequired: true,
            },
          });
        }
      }

      return created;
    });

    await this.audit.log({
      userId,
      tenantId,
      action: AuditAction.JOB_CREATED,
      entityType: 'Job',
      entityId: job.id,
      newValue: { title: job.title, status: job.status },
    });

    return job;
  }

  async findAll(tenantId: string | undefined, filterDto: JobFilterDto) {
    const where: Prisma.JobWhereInput = {
      ...(tenantId && { tenantId }),
      deletedAt: null,
      status: JobStatus.PUBLISHED, // Default to only published jobs for public search
    };

    if (filterDto.companyId) {
      where.companyId = filterDto.companyId;
    }

    if (filterDto.location) {
      where.location = { contains: filterDto.location, mode: 'insensitive' };
    }

    if (filterDto.remoteType) {
      where.remoteType = filterDto.remoteType;
    }

    if (filterDto.employmentType) {
      where.employmentType = filterDto.employmentType;
    }

    if (filterDto.experienceLevel) {
      where.experienceLevel = filterDto.experienceLevel;
    }

    if (filterDto.q) {
      where.OR = [
        { title: { contains: filterDto.q, mode: 'insensitive' } },
        { description: { contains: filterDto.q, mode: 'insensitive' } },
        { company: { name: { contains: filterDto.q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, logoUrl: true, location: true },
        },
        skills: {
          include: { skill: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
        "You do not have access to this company's jobs",
      );
    }
  }

  async findCompanyJobs(
    userId: string,
    isPlatformAdmin: boolean,
    companyId: string,
  ) {
    await this.assertCompanyAccess(userId, isPlatformAdmin, companyId);

    return this.prisma.job.findMany({
      where: { companyId, deletedAt: null },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string | undefined, idOrSlug: string) {
    const isUuid = idOrSlug.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const job = await this.prisma.job.findFirst({
      where: {
        ...(tenantId && { tenantId }),
        deletedAt: null,
        // Anonymous (public) viewers may only ever see published jobs.
        ...(!tenantId && { status: JobStatus.PUBLISHED }),
        OR: isUuid ? [{ id: idOrSlug }] : [{ slug: idOrSlug }],
      },
      include: {
        company: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(
    userId: string,
    isPlatformAdmin: boolean,
    jobId: string,
    updateDto: UpdateJobDto,
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.assertCompanyAccess(userId, isPlatformAdmin, job.companyId);

    const { skills, ...jobData } = updateDto;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          ...jobData,
          experienceLevel: jobData.experienceLevel || job.experienceLevel,
          employmentType: jobData.employmentType || job.employmentType,
          remoteType: jobData.remoteType || job.remoteType,
          applicationDeadline: jobData.applicationDeadline
            ? new Date(jobData.applicationDeadline)
            : undefined,
          publishedAt:
            jobData.status === JobStatus.PUBLISHED &&
            job.status !== JobStatus.PUBLISHED
              ? new Date()
              : undefined,
          closedAt:
            jobData.status === JobStatus.CLOSED &&
            job.status !== JobStatus.CLOSED
              ? new Date()
              : undefined,
        },
      });

      if (skills) {
        // Simple replace all strategy
        await tx.jobSkill.deleteMany({ where: { jobId } });

        for (const skillName of skills) {
          const name = skillName.trim().toLowerCase();
          let skillRecord = await tx.skill.findUnique({ where: { name } });
          if (!skillRecord) {
            skillRecord = await tx.skill.create({
              data: { name, isVerified: false },
            });
          }
          await tx.jobSkill.create({
            data: { jobId, skillId: skillRecord.id, isRequired: true },
          });
        }
      }

      return updatedJob;
    });

    await this.audit.log({
      userId,
      tenantId: job.tenantId,
      action: AuditAction.JOB_UPDATED,
      entityType: 'Job',
      entityId: jobId,
      previousValue: { status: job.status, title: job.title },
      newValue: { status: updated.status, title: updated.title },
    });

    return updated;
  }

  async remove(userId: string, isPlatformAdmin: boolean, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.assertCompanyAccess(userId, isPlatformAdmin, job.companyId);

    const removed = await this.prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      userId,
      tenantId: job.tenantId,
      action: AuditAction.JOB_DELETED,
      entityType: 'Job',
      entityId: jobId,
      previousValue: { title: job.title },
    });

    return removed;
  }
}
