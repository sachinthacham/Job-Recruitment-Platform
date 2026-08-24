import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restrict access to users with specific roles.
 *
 * @example
 * ```ts
 * @Roles('RECRUITER', 'COMPANY_ADMIN')
 * @Get('applications')
 * getApplications() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
