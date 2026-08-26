import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecruiterAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Company to report on — required for platform admins',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
