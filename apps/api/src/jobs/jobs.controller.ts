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
import { Public } from '../auth/decorators/public.decorator';
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

  // Public job board: browsable without auth. Logged-in users still see jobs
  // scoped to their own tenant; anonymous visitors see published jobs across
  // all tenants, matching a normal public job-board experience.
  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter jobs (public)' })
  findAll(
    @CurrentUser() user: JwtPayload | undefined,
    @Query() filterDto: JobFilterDto,
  ) {
    return this.jobsService.findAll(user?.tenantId ?? undefined, filterDto);
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
      user.sub,
      isPlatformAdmin,
      companyId,
    );
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get job details by ID or slug (public)' })
  findOne(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    return this.jobsService.findOne(user?.tenantId ?? undefined, idOrSlug);
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
    return this.jobsService.update(user.sub, isPlatformAdmin, id, updateJobDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Soft delete a job' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.jobsService.remove(user.sub, isPlatformAdmin, id);
  }
}
