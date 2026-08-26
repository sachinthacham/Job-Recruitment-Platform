import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, EmploymentType, OfferStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateOfferDto {
  @ApiProperty({ description: 'ID of the application being offered' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ description: 'Annual salary, in the smallest whole unit' })
  @IsInt()
  @Min(0)
  salary: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ description: 'ISO 8601 proposed start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ description: 'ISO 8601 date after which the offer lapses' })
  @IsDateString()
  expirationDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalTerms?: string;
}

export class UpdateOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalTerms?: string;
}

export enum OfferResponseDecision {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class RespondToOfferDto {
  @ApiProperty({ enum: OfferResponseDecision })
  @IsEnum(OfferResponseDecision)
  decision: OfferResponseDecision;
}

export class OfferFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
