import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../common/services/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markRead', () => {
    it('throws NotFoundException when the notification does not belong to the user', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.markRead('user-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the notification unchanged when already read', async () => {
      const notification = { id: 'notif-1', userId: 'user-1', isRead: true };
      prisma.notification.findFirst.mockResolvedValue(notification);

      const result = await service.markRead('user-1', 'notif-1');

      expect(result).toBe(notification);
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });

    it('marks an unread notification as read', async () => {
      prisma.notification.findFirst.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        isRead: false,
      });
      prisma.notification.update.mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });

      const result = await service.markRead('user-1', 'notif-1');

      expect(result).toEqual({ id: 'notif-1', isRead: true });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the notification does not belong to the user', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the notification when owned by the user', async () => {
      prisma.notification.findFirst.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
      });

      await service.remove('user-1', 'notif-1');

      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
    });
  });

  describe('unreadCount', () => {
    it('returns the count of unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.unreadCount('user-1');

      expect(result).toEqual({ count: 3 });
    });
  });
});
