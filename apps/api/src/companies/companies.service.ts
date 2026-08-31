import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto) {
    const { tenantId: requestedTenantId, ...companyData } = createCompanyDto;

    const existingCompany = await this.prisma.company.findUnique({
      where: { slug: companyData.slug },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this slug already exists');
    }

    if (requestedTenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: requestedTenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Platform admins (the only callers of this endpoint) have no tenant of
      // their own — onboarding a new company means onboarding a new tenant too,
      // unless an existing tenant id was explicitly supplied.
      const tenantId =
        requestedTenantId ??
        (
          await tx.tenant.create({
            data: {
              name: companyData.name,
              slug: `${companyData.slug}-${Math.random().toString(36).substring(2, 8)}`,
            },
          })
        ).id;

      const company = await tx.company.create({
        data: {
          ...companyData,
          tenantId,
        },
      });

      // The creator is automatically a COMPANY_ADMIN for this company
      await tx.companyUser.create({
        data: {
          companyId: company.id,
          userId,
          role: 'COMPANY_ADMIN',
        },
      });

      // Also create a recruiter profile for them if they don't have one?
      // Actually, recruiter profiles should probably be managed separately, or we just link it.
      const existingRecruiterProfile = await tx.recruiterProfile.findUnique({
        where: { userId },
      });

      if (!existingRecruiterProfile) {
        await tx.recruiterProfile.create({
          data: {
            userId,
            companyId: company.id,
          },
        });
      }

      return company;
    });
  }

  // Candidates and platform admins have no tenant of their own — for them,
  // this becomes a cross-tenant directory/lookup rather than a scoped one.
  async findAll(tenantId: string | null) {
    return this.prisma.company.findMany({
      where: { ...(tenantId && { tenantId }), deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string | null, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, ...(tenantId && { tenantId }), deletedAt: null },
      include: {
        companyUsers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(
    userId: string,
    isPlatformAdmin: boolean,
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (!isPlatformAdmin) {
      const membership = await this.prisma.companyUser.findUnique({
        where: { companyId_userId: { companyId: id, userId } },
      });

      if (
        !membership ||
        !membership.isActive ||
        membership.role !== 'COMPANY_ADMIN'
      ) {
        throw new ForbiddenException(
          'You do not have admin access to this company',
        );
      }
    }

    if (updateCompanyDto.slug && updateCompanyDto.slug !== company.slug) {
      const existing = await this.prisma.company.findUnique({
        where: { slug: updateCompanyDto.slug },
      });
      if (existing) {
        throw new ConflictException('Company with this slug already exists');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }
}
