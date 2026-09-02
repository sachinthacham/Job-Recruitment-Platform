import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';
import { AdminService } from './admin.service';
import {
  AdminUserFilterDto,
  UpdateUserStatusDto,
  AdminCompanyFilterDto,
  AuditLogFilterDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all platform users (Platform Admin)' })
  listUsers(@Query() filterDto: AdminUserFilterDto) {
    return this.adminService.listUsers(filterDto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: "Update a user's account status (Platform Admin)" })
  updateUserStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(user.sub, id, dto.status);
  }

  @Get('companies')
  @ApiOperation({
    summary: 'List all companies across tenants (Platform Admin)',
  })
  listCompanies(@Query() filterDto: AdminCompanyFilterDto) {
    return this.adminService.listCompanies(filterDto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit log entries (Platform Admin)' })
  listAuditLogs(@Query() filterDto: AuditLogFilterDto) {
    return this.adminService.listAuditLogs(filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide statistics (Platform Admin)' })
  getStats() {
    return this.adminService.getStats();
  }
}
