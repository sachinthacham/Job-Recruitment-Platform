import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { RedisService } from './services/redis.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

/**
 * CommonModule provides core infrastructure services (Prisma, Redis)
 * globally to all modules. Marked @Global so they don't need to be
 * imported individually.
 */
@Global()
@Module({
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
