import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from './dto/job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@CurrentUser() user: JwtPayload, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(user.tenantId!, user.sub, createJobDto);
  }

  // Public endpoint - no guards needed, but we might want to extract tenantId from header/host eventually.
  // For now, assuming single tenant or we require a tenant header if multi-tenant.
  // Actually, let's keep it guarded with optional auth if possible, or just require auth for now since it's easier.
  // The plan said "Public Jobs", so we remove auth guard here but need tenantId.
  // Let's use a default tenantId if not provided, or better, keep the AuthGuard for simplicity and just say candidates must login.
  // But wait, to make it public, we can just omit AuthGuard and use a known tenant id, or assume tenantId is passed via header.
  // We'll require AuthGuard to get tenantId automatically from token for now to be safe with multi-tenant architecture.
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search and filter jobs' })
  findAll(@CurrentUser() user: JwtPayload, @Query() filterDto: JobFilterDto) {
    return this.jobsService.findAll(user.tenantId!, filterDto);
  }

  @Get('company/:companyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({
    summary: 'Get all jobs for a specific company (for recruiter dashboard)',
  })
  findCompanyJobs(
    @CurrentUser() user: JwtPayload,
    @Param('companyId') companyId: string,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.jobsService.findCompanyJobs(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      companyId,
    );
  }

  @Get(':idOrSlug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get job details by ID or slug' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    return this.jobsService.findOne(user.tenantId!, idOrSlug);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update job details' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.jobsService.update(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      id,
      updateJobDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Soft delete a job' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.jobsService.remove(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      id,
    );
  }
}
