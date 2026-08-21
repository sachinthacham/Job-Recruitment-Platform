import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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

@Module({
  imports: [
    // ─── Configuration ─────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),

    // ─── Rate Limiting ─────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 10,   // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests per minute
      },
    ]),

    // ─── Core Infrastructure ───────────────────────────────
    CommonModule,

    // ─── Identity & Auth ───────────────────────────────────
    AuthModule,
    UsersModule,

    // ─── Feature Modules ───────────────────────────────────
    HealthModule,

    CompaniesModule,

    CandidatesModule,

    RecruitersModule,

    JobsModule,

    // Future modules will be added here as they are implemented:
    // CompaniesModule,
    // JobsModule,
    // ApplicationsModule,
    // InterviewsModule,
    // OffersModule,
    // NotificationsModule,
    // MessagingModule,
    // ResumesModule,
    // SkillsModule,
    // SearchModule,
    // SubscriptionsModule,
    // AnalyticsModule,
    // AuditModule,
    // AdminModule,
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
  ],
})
export class AppModule {}
