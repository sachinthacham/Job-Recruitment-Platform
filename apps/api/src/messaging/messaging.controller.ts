import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import {
  CreateConversationDto,
  SendMessageDto,
  ConversationFilterDto,
  MessageFilterDto,
} from './dto/messaging.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/auth.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new conversation' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    return this.messagingService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get the current user's conversations" })
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() filterDto: ConversationFilterDto,
  ) {
    return this.messagingService.findMine(user.sub, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single conversation by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messagingService.findOne(user.sub, id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  findMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() filterDto: MessageFilterDto,
  ) {
    return this.messagingService.findMessages(user.sub, id, filterDto);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user.sub, id, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a conversation as read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messagingService.markRead(user.sub, id);
  }
}
