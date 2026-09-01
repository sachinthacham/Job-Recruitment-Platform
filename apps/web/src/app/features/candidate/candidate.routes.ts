import { Routes } from '@angular/router';
import { AppShellComponent, ShellNavItem } from '../../core/layout/app-shell.component';

const CANDIDATE_NAV: ShellNavItem[] = [
  { label: 'Dashboard', path: 'dashboard', icon: '🏠' },
  { label: 'Browse Jobs', path: '/jobs', icon: '🔍' },
  { label: 'My Applications', path: 'applications', icon: '📄' },
  { label: 'Interviews', path: 'interviews', icon: '📅' },
  { label: 'Offers', path: 'offers', icon: '🎉' },
  { label: 'Messages', path: 'messages', icon: '💬' },
  { label: 'Notifications', path: 'notifications', icon: '🔔' },
  { label: 'Profile', path: 'profile', icon: '👤' },
];

export const CANDIDATE_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    data: { roleLabel: 'Candidate', navItems: CANDIDATE_NAV },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.CandidateDashboardComponent),
        title: 'Candidate Dashboard | RecruitPro'
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./profile-editor/profile-editor.component').then(m => m.ProfileEditorComponent),
        title: 'Edit Profile | RecruitPro'
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile-view/profile-view.component').then(m => m.ProfileViewComponent),
        title: 'My Profile | RecruitPro'
      },
      {
        path: 'applications',
        loadComponent: () => import('./applications/applications.component').then(m => m.CandidateApplicationsComponent),
        title: 'My Applications | RecruitPro'
      },
      {
        path: 'interviews',
        loadComponent: () => import('./interviews/interviews.component').then(m => m.CandidateInterviewsComponent),
        title: 'My Interviews | RecruitPro'
      },
      {
        path: 'offers',
        loadComponent: () => import('./offers/offers.component').then(m => m.CandidateOffersComponent),
        title: 'My Offers | RecruitPro'
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
        pathMatch: 'full'
      }
    ]
  }
];
