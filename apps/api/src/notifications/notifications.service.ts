import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';
import { NotificationFilterDto } from './dto/notification.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, filterDto: NotificationFilterDto) {
    const where = {
      userId,
      ...(filterDto.isRead !== undefined && { isRead: filterDto.isRead }),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: filterDto.sortOrder ?? 'desc' },
        skip: (filterDto.page - 1) * filterDto.perPage,
        take: filterDto.perPage,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return PaginatedResponseDto.create(
      data,
      total,
      filterDto.page,
      filterDto.perPage,
    );
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { count: result.count };
  }

  async remove(userId: string, notificationId: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id: notificationId } });
  }

  /** Used internally by other modules to raise a notification for a user. */
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Prisma.InputJsonValue,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, data: data ?? {} },
    });
  }
}
