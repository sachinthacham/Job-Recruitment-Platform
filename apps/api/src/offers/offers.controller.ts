import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import {
  CreateOfferDto,
  UpdateOfferDto,
  RespondToOfferDto,
  OfferFilterDto,
} from './dto/offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create a draft offer for an application' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOfferDto) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.create(user.sub, isPlatformAdmin, dto);
  }

  @Get('me')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: "Get the current candidate's offers" })
  findMyOffers(
    @CurrentUser() user: JwtPayload,
    @Query() filterDto: OfferFilterDto,
  ) {
    return this.offersService.findMyOffers(user.sub, filterDto);
  }

  @Get('application/:applicationId')
  @Roles('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get the offer for an application' })
  findByApplication(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.findByApplication(
      user.sub,
      isPlatformAdmin,
      applicationId,
    );
  }

  @Get(':id')
  @Roles('CANDIDATE', 'RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get a single offer by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.findOne(user.sub, isPlatformAdmin, id);
  }

  @Patch(':id')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update offer terms' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.update(user.sub, isPlatformAdmin, id, dto);
  }

  @Patch(':id/send')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Send a draft offer to the candidate' })
  send(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.send(user.sub, isPlatformAdmin, id);
  }

  @Patch(':id/respond')
  @Roles('CANDIDATE')
  @ApiOperation({ summary: 'Accept or reject an offer' })
  respond(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RespondToOfferDto,
  ) {
    return this.offersService.respond(user.sub, id, dto);
  }

  @Delete(':id')
  @Roles('RECRUITER', 'COMPANY_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Withdraw an offer' })
  withdraw(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isPlatformAdmin = user.roles.includes('PLATFORM_ADMIN');
    return this.offersService.withdraw(user.sub, isPlatformAdmin, id);
  }
}
