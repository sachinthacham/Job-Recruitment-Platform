import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InterviewType,
  InterviewStatus,
  InterviewRecommendation,
} from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ScheduleInterviewDto {
  @ApiProperty({ description: 'ID of the application being interviewed' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ example: 'Technical Screen — Round 1' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'ISO 8601 date-time of the interview' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: 'Duration in minutes', example: 45 })
  @IsInt()
  @Min(5)
  duration: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  meetingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'User IDs of the interviewers to add as participants',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  interviewerIds: string[];
}

export class UpdateInterviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(5)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  meetingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewStatusDto {
  @ApiProperty({ enum: InterviewStatus })
  @IsEnum(InterviewStatus)
  status: InterviewStatus;
}

export class InterviewFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}

export class SubmitInterviewFeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  technicalRating?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  cultureFitRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weaknesses?: string;

  @ApiProperty({ enum: InterviewRecommendation })
  @IsEnum(InterviewRecommendation)
  recommendation: InterviewRecommendation;

  @ApiPropertyOptional({
    description: 'Notes visible only to the hiring team, never the candidate',
  })
  @IsOptional()
  @IsString()
  privateNotes?: string;
}
