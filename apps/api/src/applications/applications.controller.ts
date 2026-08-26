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
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationFilterDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Apply to a job' })
  apply(@CurrentUser() user: JwtPayload, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.apply(user.tenantId!, user.sub, dto);
  }

  @Get('me')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: "Get the current candidate's applications" })
  findMyApplications(
    @CurrentUser() user: JwtPayload,
    @Query() filterDto: ApplicationFilterDto,
  ) {
    return this.applicationsService.findMyApplications(
      user.tenantId!,
      user.sub,
      filterDto,
    );
  }

  @Get('job/:jobId')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({
    summary: 'Get all applications for a job (recruiter pipeline view)',
  })
  findJobApplications(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
    @Query() filterDto: ApplicationFilterDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.applicationsService.findJobApplications(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      jobId,
      filterDto,
    );
  }

  @Get(':id')
  @Roles('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get a single application by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.applicationsService.findOne(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      id,
    );
  }

  @Patch(':id/status')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({
    summary: 'Update an application status (pipeline transition)',
  })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.applicationsService.updateStatus(
      user.tenantId!,
      user.sub,
      isPlatformAdmin,
      id,
      dto,
    );
  }

  @Delete(':id')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Withdraw an application' })
  withdraw(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.withdraw(user.tenantId!, user.sub, id);
  }
}
