import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory that creates a guard restricting access to users with specific roles.
 * Usage: canActivate: [roleGuard('RECRUITER', 'COMPANY_ADMIN')]
 */
export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.hasAnyRole(...allowedRoles)) {
      return true;
    }

    // User is logged in but doesn't have the required role — redirect to their dashboard
    router.navigate([authService.getDefaultRoute()]);
    return false;
  };
}
