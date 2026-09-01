import { Routes } from '@angular/router';

export const JOBS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./job-list/job-list.component').then(m => m.JobListComponent),
    title: 'Find Jobs | RecruitPro'
  },
  {
    path: ':idOrSlug',
    loadComponent: () => import('./job-detail/job-detail.component').then(m => m.JobDetailComponent),
    title: 'Job Details | RecruitPro'
  }
];
