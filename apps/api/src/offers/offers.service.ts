import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { ApplicationStatus, OfferStatus } from '@prisma/client';
import {
  CreateOfferDto,
  UpdateOfferDto,
  RespondToOfferDto,
  OfferResponseDecision,
  OfferFilterDto,
} from './dto/offer.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

const TERMINAL_STATUSES: OfferStatus[] = [
  OfferStatus.ACCEPTED,
  OfferStatus.REJECTED,
  OfferStatus.EXPIRED,
  OfferStatus.WITHDRAWN,
];

const OFFER_INCLUDE = {
  application: {
    select: {
      id: true,
      candidateId: true,
      job: { select: { id: true, title: true, companyId: true } },
    },
  },
};

@Injectable()
export class OffersService {
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
        "You do not have access to this company's offers",
      );
    }
  }

  private async expireIfLapsed<
    T extends { id: string; status: OfferStatus; expirationDate: Date },
  >(offer: T): Promise<T> {
    const isLapsed =
      (offer.status === OfferStatus.SENT ||
        offer.status === OfferStatus.VIEWED) &&
      offer.expirationDate.getTime() < Date.now();

    if (!isLapsed) {
      return offer;
    }

    await this.prisma.offer.update({
      where: { id: offer.id },
      data: { status: OfferStatus.EXPIRED },
    });

    return { ...offer, status: OfferStatus.EXPIRED };
  }

  async create(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    dto: CreateOfferDto,
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

    const existing = await this.prisma.offer.findUnique({
      where: { applicationId: dto.applicationId },
    });

    if (existing) {
      throw new ConflictException(
        'An offer already exists for this application',
      );
    }

    return this.prisma.offer.create({
      data: {
        applicationId: dto.applicationId,
        candidateId: application.candidateId,
        salary: dto.salary,
        currency: dto.currency,
        benefits: dto.benefits,
        startDate: new Date(dto.startDate),
        employmentType: dto.employmentType,
        expirationDate: new Date(dto.expirationDate),
        additionalTerms: dto.additionalTerms,
        createdById: userId,
      },
    });
  }

  async findMyOffers(
    tenantId: string,
    candidateId: string,
    filterDto: OfferFilterDto,
  ) {
    const where = {
      candidateId,
      application: { job: { tenantId } },
      status: { not: OfferStatus.DRAFT },
      ...(filterDto.status && { status: filterDto.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: OFFER_INCLUDE,
        orderBy: { createdAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.offer.count({ where }),
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

    const offer = await this.prisma.offer.findUnique({
      where: { applicationId },
      include: OFFER_INCLUDE,
    });

    if (!offer || (isOwner && offer.status === OfferStatus.DRAFT)) {
      throw new NotFoundException('Offer not found');
    }

    return this.resolveForViewer(offer, isOwner);
  }

  async findOne(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    offerId: string,
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, application: { job: { tenantId } } },
      include: OFFER_INCLUDE,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const isOwner = offer.application.candidateId === userId;

    if (isOwner && offer.status === OfferStatus.DRAFT) {
      throw new NotFoundException('Offer not found');
    }

    if (!isOwner && !isPlatformAdmin) {
      await this.assertCompanyAccess(
        userId,
        false,
        offer.application.job.companyId,
      );
    }

    return this.resolveForViewer(offer, isOwner);
  }

  private async resolveForViewer<
    T extends { id: string; status: OfferStatus; expirationDate: Date },
  >(offer: T, isOwner: boolean): Promise<T> {
    const resolved = await this.expireIfLapsed(offer);

    if (isOwner && resolved.status === OfferStatus.SENT) {
      const viewed = await this.prisma.offer.update({
        where: { id: resolved.id },
        data: { status: OfferStatus.VIEWED },
      });

      return { ...resolved, status: viewed.status };
    }

    return resolved;
  }

  async update(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    offerId: string,
    dto: UpdateOfferDto,
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, application: { job: { tenantId } } },
      include: OFFER_INCLUDE,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      offer.application.job.companyId,
    );

    if (TERMINAL_STATUSES.includes(offer.status)) {
      throw new BadRequestException(
        `Cannot modify a ${offer.status.toLowerCase()} offer`,
      );
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : undefined,
      },
      include: OFFER_INCLUDE,
    });
  }

  async send(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    offerId: string,
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, application: { job: { tenantId } } },
      include: OFFER_INCLUDE,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      offer.application.job.companyId,
    );

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Only a draft offer can be sent');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.SENT },
      });

      await tx.application.update({
        where: { id: offer.application.id },
        data: { status: ApplicationStatus.OFFERED },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: offer.application.id,
          previousStatus: ApplicationStatus.INTERVIEW,
          newStatus: ApplicationStatus.OFFERED,
          changedById: userId,
          notes: 'Offer sent',
        },
      });

      return updated;
    });
  }

  async withdraw(
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    offerId: string,
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, application: { job: { tenantId } } },
      include: OFFER_INCLUDE,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.assertCompanyAccess(
      userId,
      isPlatformAdmin,
      offer.application.job.companyId,
    );

    if (TERMINAL_STATUSES.includes(offer.status)) {
      throw new BadRequestException(
        `Cannot withdraw a ${offer.status.toLowerCase()} offer`,
      );
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.WITHDRAWN, respondedAt: new Date() },
    });
  }

  async respond(
    tenantId: string,
    candidateId: string,
    offerId: string,
    dto: RespondToOfferDto,
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: {
        id: offerId,
        candidateId,
        application: { job: { tenantId } },
      },
      include: OFFER_INCLUDE,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const resolved = await this.expireIfLapsed(offer);

    if (
      resolved.status !== OfferStatus.SENT &&
      resolved.status !== OfferStatus.VIEWED
    ) {
      throw new BadRequestException(
        `Cannot respond to a ${resolved.status.toLowerCase()} offer`,
      );
    }

    const newOfferStatus =
      dto.decision === OfferResponseDecision.ACCEPTED
        ? OfferStatus.ACCEPTED
        : OfferStatus.REJECTED;
    const newApplicationStatus =
      dto.decision === OfferResponseDecision.ACCEPTED
        ? ApplicationStatus.HIRED
        : ApplicationStatus.REJECTED;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.offer.update({
        where: { id: offerId },
        data: { status: newOfferStatus, respondedAt: new Date() },
      });

      await tx.application.update({
        where: { id: offer.application.id },
        data: { status: newApplicationStatus },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: offer.application.id,
          previousStatus: ApplicationStatus.OFFERED,
          newStatus: newApplicationStatus,
          changedById: candidateId,
          notes: `Candidate ${dto.decision.toLowerCase()} the offer`,
        },
      });

      return updated;
    });
  }
}
