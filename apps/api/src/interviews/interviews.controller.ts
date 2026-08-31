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
import { InterviewsService } from './interviews.service';
import {
  ScheduleInterviewDto,
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  InterviewFilterDto,
  SubmitInterviewFeedbackDto,
} from './dto/interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Schedule an interview for an application' })
  schedule(@CurrentUser() user: JwtPayload, @Body() dto: ScheduleInterviewDto) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.schedule(user.sub, isPlatformAdmin, dto);
  }

  @Get('me')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: "Get the current candidate's interviews" })
  findMyInterviews(
    @CurrentUser() user: JwtPayload,
    @Query() filterDto: InterviewFilterDto,
  ) {
    return this.interviewsService.findMyInterviews(user.sub, filterDto);
  }

  @Get('application/:applicationId')
  @Roles('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get all interviews for an application' })
  findByApplication(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Query() filterDto: InterviewFilterDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.findByApplication(
      user.sub,
      isPlatformAdmin,
      applicationId,
      filterDto,
    );
  }

  @Get(':id')
  @Roles('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get a single interview by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.findOne(user.sub, isPlatformAdmin, id);
  }

  @Patch(':id')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Reschedule or update interview details' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.update(user.sub, isPlatformAdmin, id, dto);
  }

  @Patch(':id/status')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update an interview status' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.updateStatus(
      user.sub,
      isPlatformAdmin,
      id,
      dto,
    );
  }

  @Delete(':id')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Cancel an interview' })
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.cancel(user.sub, isPlatformAdmin, id);
  }

  @Post(':id/feedback')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Submit interview feedback' })
  submitFeedback(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SubmitInterviewFeedbackDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.submitFeedback(
      user.sub,
      isPlatformAdmin,
      id,
      dto,
    );
  }

  @Get(':id/feedback')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get all feedback submitted for an interview' })
  findFeedback(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.interviewsService.findFeedback(user.sub, isPlatformAdmin, id);
  }
}
