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

  async create(
    tenantId: string,
    userId: string,
    createCompanyDto: CreateCompanyDto,
  ) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { slug: createCompanyDto.slug },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this slug already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          ...createCompanyDto,
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

  async findAll(tenantId: string) {
    return this.prisma.company.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId, deletedAt: null },
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
    tenantId: string,
    userId: string,
    isPlatformAdmin: boolean,
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId, deletedAt: null },
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
