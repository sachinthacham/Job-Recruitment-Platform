import { Routes } from '@angular/router';
import { AppShellComponent, ShellNavItem } from '../../core/layout/app-shell.component';

const RECRUITER_NAV: ShellNavItem[] = [
  { label: 'Dashboard', path: 'dashboard', icon: '🏠' },
  { label: 'Jobs', path: 'jobs', icon: '💼' },
  { label: 'Interviews', path: 'interviews', icon: '📅' },
  { label: 'Offers', path: 'offers', icon: '🎉' },
  { label: 'Messages', path: 'messages', icon: '💬' },
  { label: 'Notifications', path: 'notifications', icon: '🔔' },
  { label: 'Analytics', path: 'analytics', icon: '📊' },
  { label: 'Billing', path: 'billing', icon: '💳', roles: ['COMPANY_ADMIN', 'PLATFORM_ADMIN'] },
  { label: 'Company', path: 'company', icon: '🏢' },
  { label: 'Profile', path: 'profile', icon: '👤' },
];

export const RECRUITER_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    data: { roleLabel: 'Recruiter', navItems: RECRUITER_NAV },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.RecruiterDashboardComponent),
        title: 'Recruiter Dashboard | RecruitPro'
      },
      {
        path: 'profile',
        loadComponent: () => import('./recruiter-profile/recruiter-profile.component').then(m => m.RecruiterProfileComponent),
        title: 'My Profile | RecruitPro'
      },
      {
        path: 'company',
        loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent),
        title: 'Company Profile | RecruitPro'
      },
      {
        path: 'jobs',
        loadComponent: () => import('./job-management/job-management.component').then(m => m.JobManagementComponent),
        title: 'Manage Jobs | RecruitPro'
      },
      {
        path: 'jobs/new',
        loadComponent: () => import('./job-editor/job-editor.component').then(m => m.JobEditorComponent),
        title: 'Post New Job | RecruitPro'
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () => import('./job-editor/job-editor.component').then(m => m.JobEditorComponent),
        title: 'Edit Job | RecruitPro'
      },
      {
        path: 'jobs/:jobId/applicants',
        loadComponent: () => import('./applicants/applicants.component').then(m => m.ApplicantsComponent),
        title: 'Applicants | RecruitPro'
      },
      {
        path: 'interviews',
        loadComponent: () => import('./interviews/interviews.component').then(m => m.RecruiterInterviewsComponent),
        title: 'Interviews | RecruitPro'
      },
      {
        path: 'interviews/schedule/:applicationId',
        loadComponent: () => import('./interviews/schedule-interview.component').then(m => m.ScheduleInterviewComponent),
        title: 'Schedule Interview | RecruitPro'
      },
      {
        path: 'interviews/:id/feedback',
        loadComponent: () => import('./interviews/interview-feedback.component').then(m => m.InterviewFeedbackComponent),
        title: 'Interview Feedback | RecruitPro'
      },
      {
        path: 'offers',
        loadComponent: () => import('./offers/offers.component').then(m => m.RecruiterOffersComponent),
        title: 'Offers | RecruitPro'
      },
      {
        path: 'offers/new/:applicationId',
        loadComponent: () => import('./offers/offer-editor.component').then(m => m.OfferEditorComponent),
        title: 'Create Offer | RecruitPro'
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
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then(m => m.RecruiterAnalyticsComponent),
        title: 'Analytics | RecruitPro'
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent),
        title: 'Billing | RecruitPro'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
