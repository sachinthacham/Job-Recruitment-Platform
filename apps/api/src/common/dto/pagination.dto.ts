import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: DEFAULT_PER_PAGE,
    minimum: 1,
    maximum: MAX_PER_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PER_PAGE)
  perPage: number = DEFAULT_PER_PAGE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginationMetaDto {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;

  constructor(page: number, perPage: number, total: number) {
    this.page = page;
    this.perPage = perPage;
    this.total = total;
    this.totalPages = Math.ceil(total / perPage);
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(
      data,
      new PaginationMetaDto(page, perPage, total),
    );
  }
}
