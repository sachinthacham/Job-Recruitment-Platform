import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CompaniesModule } from './companies/companies.module';
import { CandidatesModule } from './candidates/candidates.module';
import { RecruitersModule } from './recruiters/recruiters.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { OffersModule } from './offers/offers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagingModule } from './messaging/messaging.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuditModule } from './audit/audit.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // ─── Configuration ─────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      validate: validateEnv,
    }),

    // ─── Rate Limiting ─────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // ─── Core Infrastructure ───────────────────────────────
    CommonModule,
    AuditModule,

    // ─── Identity & Auth ───────────────────────────────────
    AuthModule,
    UsersModule,

    // ─── Feature Modules ───────────────────────────────────
    HealthModule,

    CompaniesModule,

    CandidatesModule,

    RecruitersModule,

    JobsModule,

    ApplicationsModule,

    InterviewsModule,

    OffersModule,

    NotificationsModule,

    MessagingModule,

    AnalyticsModule,

    SubscriptionsModule,

    AdminModule,

    // Future modules will be added here as they are implemented:
    // ResumesModule,
    // SkillsModule,
    // SearchModule,
  ],
  providers: [
    // ─── Global Guards ─────────────────────────────────────
    // JWT auth guard applied globally — use @Public() to skip
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Roles guard applied globally — use @Roles() to restrict
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Rate limiting applied globally — use @SkipThrottle()/@Throttle() to override
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
