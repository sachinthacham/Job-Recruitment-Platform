import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  IsUUID,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CompanySize } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'acme-corp' })
  @IsString()
  @MaxLength(250)
  slug: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ enum: CompanySize, example: CompanySize.MEDIUM })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 2010 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @ApiPropertyOptional({ example: 'We make roadrunner traps.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Remote work, Health insurance' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({
    description:
      'Attach this company to an existing tenant. Platform admins have no tenant ' +
      'of their own, so if omitted a brand-new tenant is created for this company.',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Fast-paced and fun.' })
  @IsOptional()
  @IsString()
  culture?: string;
}
