import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class SubscribeDto {
  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiPropertyOptional({
    description: 'Tenant to subscribe — required for platform admins',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class TenantScopedQueryDto {
  @ApiPropertyOptional({
    description: 'Tenant to look up — required for platform admins',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class PaymentFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Tenant to look up — required for platform admins',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
