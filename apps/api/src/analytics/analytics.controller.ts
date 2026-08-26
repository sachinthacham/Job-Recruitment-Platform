import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RecruiterAnalyticsQueryDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('recruiter')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: "Get a company's recruiting dashboard" })
  getRecruiterDashboard(
    @CurrentUser() user: JwtPayload,
    @Query() query: RecruiterAnalyticsQueryDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.analyticsService.getRecruiterDashboard(
      user.sub,
      isPlatformAdmin,
      query.companyId,
    );
  }

  @Get('candidate')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: "Get the current candidate's application stats" })
  getCandidateDashboard(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getCandidateDashboard(user.sub);
  }

  @Get('platform')
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  getPlatformDashboard() {
    return this.analyticsService.getPlatformDashboard();
  }
}
