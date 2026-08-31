import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create a new company (Platform Admin only)' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.create(user.sub, createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies in tenant' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.companiesService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.companiesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Update company details' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.companiesService.update(
      user.sub,
      isPlatformAdmin,
      id,
      updateCompanyDto,
    );
  }
}
