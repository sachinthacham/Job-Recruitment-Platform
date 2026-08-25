import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import {
  UpdateCandidateProfileDto,
  AddSkillDto,
  AddEducationDto,
  AddExperienceDto,
} from './dto/candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get('me')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Get current user candidate profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.candidatesService.getProfile(user.sub);
  }

  @Patch('me')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Update current user candidate profile' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateCandidateProfileDto,
  ) {
    return this.candidatesService.updateProfile(user.sub, updateDto);
  }

  @Post('me/skills')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Add a skill to profile' })
  addSkill(@CurrentUser() user: JwtPayload, @Body() skillDto: AddSkillDto) {
    return this.candidatesService.addSkill(user.sub, skillDto);
  }

  @Delete('me/skills/:id')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Remove a skill from profile' })
  removeSkill(@CurrentUser() user: JwtPayload, @Param('id') skillId: string) {
    return this.candidatesService.removeSkill(user.sub, skillId);
  }

  @Post('me/education')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Add education to profile' })
  addEducation(@CurrentUser() user: JwtPayload, @Body() dto: AddEducationDto) {
    return this.candidatesService.addEducation(user.sub, dto);
  }

  @Delete('me/education/:id')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Remove education from profile' })
  removeEducation(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.candidatesService.removeEducation(user.sub, id);
  }

  @Post('me/experience')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Add work experience to profile' })
  addExperience(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddExperienceDto,
  ) {
    return this.candidatesService.addExperience(user.sub, dto);
  }

  @Delete('me/experience/:id')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Remove work experience from profile' })
  removeExperience(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.candidatesService.removeExperience(user.sub, id);
  }
}
