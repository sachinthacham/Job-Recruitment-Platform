import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscribeDto,
  TenantScopedQueryDto,
  PaymentFilterDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List the available subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('current')
  @Roles('COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: "Get the tenant's current subscription" })
  getCurrent(
    @CurrentUser() user: JwtPayload,
    @Query() query: TenantScopedQueryDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.subscriptionsService.getCurrent(
      user.tenantId,
      isPlatformAdmin,
      query.tenantId,
    );
  }

  @Post('subscribe')
  @Roles('COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Subscribe to or change a plan' })
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.subscriptionsService.subscribe(
      user.tenantId,
      isPlatformAdmin,
      dto,
    );
  }

  @Patch('cancel')
  @Roles('COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: "Cancel the tenant's active subscription" })
  cancel(
    @CurrentUser() user: JwtPayload,
    @Query() query: TenantScopedQueryDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.subscriptionsService.cancel(
      user.tenantId,
      isPlatformAdmin,
      query.tenantId,
    );
  }

  @Get('payments')
  @Roles('COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: "Get the tenant's payment history" })
  listPayments(
    @CurrentUser() user: JwtPayload,
    @Query() filterDto: PaymentFilterDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.subscriptionsService.listPayments(
      user.tenantId,
      isPlatformAdmin,
      filterDto,
    );
  }
}
