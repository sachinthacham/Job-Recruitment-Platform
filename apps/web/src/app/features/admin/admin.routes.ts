import { Routes } from '@angular/router';
import { AppShellComponent, ShellNavItem } from '../../core/layout/app-shell.component';

const ADMIN_NAV: ShellNavItem[] = [
  { label: 'Dashboard', path: 'dashboard', icon: '🏠' },
  { label: 'Users', path: 'users', icon: '👥' },
  { label: 'Companies', path: 'companies', icon: '🏢' },
  { label: 'Audit Logs', path: 'audit-logs', icon: '📜' },
  { label: 'Messages', path: 'messages', icon: '💬' },
  { label: 'Notifications', path: 'notifications', icon: '🔔' },
];

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    data: { roleLabel: 'Platform Admin', navItems: ADMIN_NAV },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
        title: 'Admin Dashboard | RecruitPro',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/admin-users.component').then((m) => m.AdminUsersComponent),
        title: 'Manage Users | RecruitPro',
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./companies/admin-companies.component').then(
            (m) => m.AdminCompaniesComponent,
          ),
        title: 'Companies | RecruitPro',
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./audit-logs/admin-audit-logs.component').then(
            (m) => m.AdminAuditLogsComponent,
          ),
        title: 'Audit Logs | RecruitPro',
      },
      {
        path: 'messages',
        loadComponent: () => import('../shared/messages/messages.component').then(m => m.MessagesComponent),
        title: 'Messages | RecruitPro'
      },
      {
        path: 'messages/:id',
        loadComponent: () => import('../shared/messages/messages.component').then(m => m.MessagesComponent),
        title: 'Messages | RecruitPro'
      },
      {
        path: 'notifications',
        loadComponent: () => import('../shared/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications | RecruitPro'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
