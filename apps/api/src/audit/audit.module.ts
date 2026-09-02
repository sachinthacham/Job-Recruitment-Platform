import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/**
 * Global like CommonModule — AuditService is a cross-cutting concern consumed by
 * many otherwise-unrelated feature modules (Jobs, Interviews, Offers, Subscriptions, Admin).
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
