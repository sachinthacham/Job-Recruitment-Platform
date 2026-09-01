import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ─── Public Routes ───────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
    title: 'RecruitPro — Enterprise Recruitment Platform',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ─── Candidate Routes ────────────────────────────────────
  {
    path: 'candidate',
    loadChildren: () =>
      import('./features/candidate/candidate.routes').then(
        (m) => m.CANDIDATE_ROUTES,
      ),
    canActivate: [authGuard],
  },

  // ─── Recruiter Routes ────────────────────────────────────
  {
    path: 'recruiter',
    loadChildren: () =>
      import('./features/recruiter/recruiter.routes').then(
        (m) => m.RECRUITER_ROUTES,
      ),
    canActivate: [authGuard, roleGuard('RECRUITER', 'HIRING_MANAGER', 'COMPANY_ADMIN')],
  },

  // ─── Admin Routes ────────────────────────────────────────
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard('PLATFORM_ADMIN')],
  },

  // ─── Jobs (Public) ───────────────────────────────────────
  {
    path: 'jobs',
    loadChildren: () =>
      import('./features/jobs/jobs.routes').then((m) => m.JOBS_ROUTES),
  },

  // ─── Fallback ────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Page Not Found — RecruitPro',
  },
];
