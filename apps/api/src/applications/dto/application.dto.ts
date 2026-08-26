import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateApplicationDto {
  @ApiProperty({ description: 'ID of the job being applied to' })
  @IsUUID()
  jobId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverLetter?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Internal recruiter note about this status change',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApplicationFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
