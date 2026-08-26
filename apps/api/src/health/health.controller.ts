import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../common/services/prisma.service';
import { RedisService } from '../common/services/redis.service';

interface HealthCheckResult {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  message?: string;
}

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheckResult[];
}

@Public()
@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Basic health check — returns 200 if the process is alive.
   */
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async check(): Promise<HealthResponse> {
    const checks = await this.runChecks();
    const allHealthy = checks.every((c) => c.status === 'up');

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };
  }

  /**
   * Liveness probe — is the process running?
   * Used by Kubernetes/Docker to determine if the container needs restart.
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /**
   * Readiness probe — can the process accept traffic?
   * Checks database and Redis connectivity.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready(): Promise<HealthResponse> {
    const checks = await this.runChecks();
    const allHealthy = checks.every((c) => c.status === 'up');

    const response: HealthResponse = {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };

    return response;
  }

  private async runChecks(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    // Database check
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.push({
        name: 'database',
        status: 'up',
        responseTime: Date.now() - dbStart,
      });
    } catch (error) {
      checks.push({
        name: 'database',
        status: 'down',
        responseTime: Date.now() - dbStart,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Redis check
    const redisStart = Date.now();
    try {
      const isHealthy = await this.redis.isHealthy();
      checks.push({
        name: 'redis',
        status: isHealthy ? 'up' : 'down',
        responseTime: Date.now() - redisStart,
      });
    } catch (error) {
      checks.push({
        name: 'redis',
        status: 'down',
        responseTime: Date.now() - redisStart,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return checks;
  }
}
