import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ExperienceLevel,
  Currency,
  EmploymentType,
  RemoteType,
  JobStatus,
} from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Developer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'We are looking for a senior frontend developer...' })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: RemoteType })
  @IsOptional()
  @IsEnum(RemoteType)
  remoteType?: RemoteType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfOpenings?: number;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]; // Array of skill names to associate with the job
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class JobFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string; // search query for title/description

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: RemoteType })
  @IsOptional()
  @IsEnum(RemoteType)
  remoteType?: RemoteType;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;
}
