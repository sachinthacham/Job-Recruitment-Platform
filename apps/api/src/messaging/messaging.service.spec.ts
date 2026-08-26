import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../common/services/prisma.service';

describe('MessagingService', () => {
  let service: MessagingService;
  let prisma: {
    conversationParticipant: {
      findUnique: jest.Mock;
      createMany: jest.Mock;
      update: jest.Mock;
    };
    user: { count: jest.Mock };
    conversation: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    message: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      conversationParticipant: {
        findUnique: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
      },
      user: { count: jest.fn() },
      conversation: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      message: { create: jest.fn() },
      $transaction: jest.fn((arg: unknown) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }

        return (arg as (tx: unknown) => unknown)({
          conversation: prisma.conversation,
          conversationParticipant: prisma.conversationParticipant,
          message: prisma.message,
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws BadRequestException when no other participants remain after dedupe', async () => {
      await expect(
        service.create('user-1', { participantIds: ['user-1'] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when a participant does not exist', async () => {
      prisma.user.count.mockResolvedValue(0);

      await expect(
        service.create('user-1', { participantIds: ['user-2'] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates a conversation with the deduped participants', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.conversation.create.mockResolvedValue({ id: 'conv-1' });
      prisma.conversation.findUnique.mockResolvedValue({ id: 'conv-1' });

      const result = await service.create('user-1', {
        participantIds: ['user-2'],
      });

      expect(result).toEqual({ id: 'conv-1' });
      expect(prisma.conversationParticipant.createMany).toHaveBeenCalledWith({
        data: [
          { conversationId: 'conv-1', userId: 'user-1' },
          { conversationId: 'conv-1', userId: 'user-2' },
        ],
      });
    });
  });

  describe('sendMessage', () => {
    it('throws ForbiddenException when the user is not a participant', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('user-1', 'conv-1', { content: 'hi' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates the message when the user is a participant', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue({
        id: 'part-1',
      });
      prisma.message.create.mockResolvedValue({ id: 'msg-1' });
      prisma.conversation.update.mockResolvedValue({ id: 'conv-1' });

      const result = await service.sendMessage('user-1', 'conv-1', {
        content: 'hi',
      });

      expect(result).toEqual({ id: 'msg-1' });
    });
  });

  describe('markRead', () => {
    it('throws ForbiddenException when the user is not a participant', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue(null);

      await expect(service.markRead('user-1', 'conv-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('updates lastReadAt when the user is a participant', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue({
        id: 'part-1',
      });
      prisma.conversationParticipant.update.mockResolvedValue({
        id: 'part-1',
      });

      const result = await service.markRead('user-1', 'conv-1');

      expect(result).toEqual({ id: 'part-1' });
    });
  });
});
