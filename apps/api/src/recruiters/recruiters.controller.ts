import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecruitersService } from './recruiters.service';
import { UpdateRecruiterProfileDto } from './dto/recruiter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Recruiters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recruiters')
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  @Get('me')
  @Roles('RECRUITER', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Get current user recruiter profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.recruitersService.getProfile(user.sub);
  }

  @Patch('me')
  @Roles('RECRUITER', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Update current user recruiter profile' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateRecruiterProfileDto,
  ) {
    return this.recruitersService.updateProfile(user.sub, updateDto);
  }
}
