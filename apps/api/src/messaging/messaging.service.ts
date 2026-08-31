import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { NotificationType } from '@prisma/client';
import {
  CreateConversationDto,
  SendMessageDto,
  ConversationFilterDto,
  MessageFilterDto,
} from './dto/messaging.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';

const CONVERSATION_INCLUDE = {
  participants: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  messages: {
    take: 1,
    orderBy: { createdAt: 'desc' as const },
  },
};

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }
  }

  async create(userId: string, dto: CreateConversationDto) {
    const participantIds = [...new Set(dto.participantIds)].filter(
      (id) => id !== userId,
    );

    if (participantIds.length === 0) {
      throw new BadRequestException(
        'A conversation needs at least one other participant',
      );
    }

    const existingUsers = await this.prisma.user.count({
      where: { id: { in: participantIds } },
    });

    if (existingUsers !== participantIds.length) {
      throw new NotFoundException('One or more participants were not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: { title: dto.title },
      });

      await tx.conversationParticipant.createMany({
        data: [userId, ...participantIds].map((participantId) => ({
          conversationId: conversation.id,
          userId: participantId,
        })),
      });

      if (dto.initialMessage) {
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: userId,
            content: dto.initialMessage,
          },
        });
      }

      return tx.conversation.findUnique({
        where: { id: conversation.id },
        include: CONVERSATION_INCLUDE,
      });
    });
  }

  async findMine(userId: string, filterDto: ConversationFilterDto) {
    const where = { participants: { some: { userId } } };

    const [data, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: CONVERSATION_INCLUDE,
        orderBy: { updatedAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async findOne(userId: string, conversationId: string) {
    await this.assertParticipant(conversationId, userId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: CONVERSATION_INCLUDE,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async findMessages(
    userId: string,
    conversationId: string,
    filterDto: MessageFilterDto,
  ) {
    await this.assertParticipant(conversationId, userId);

    const where = { conversationId };

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: filterDto.sortOrder ?? 'asc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.message.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    await this.assertParticipant(conversationId, userId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: dto.content,
          attachmentUrl: dto.attachmentUrl,
          attachmentName: dto.attachmentName,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const recipients = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });

    await Promise.all(
      recipients.map((recipient) =>
        this.notifications.create(
          recipient.userId,
          NotificationType.MESSAGE_RECEIVED,
          'New message',
          `${message.sender.firstName} ${message.sender.lastName} sent you a message`,
          { conversationId, messageId: message.id },
        ),
      ),
    );

    return message;
  }

  async markRead(userId: string, conversationId: string) {
    await this.assertParticipant(conversationId, userId);

    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }
}
