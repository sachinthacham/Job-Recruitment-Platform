import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="job-list-container">
      <header class="page-header">
        <h1>Find Your Next Role</h1>
        <p>Browse open positions at top companies.</p>
      </header>

      <section class="search-section card">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="search-form">
          <div class="search-input">
            <span class="icon">🔍</span>
            <input type="text" formControlName="q" placeholder="Job title, keywords, or company...">
          </div>
          
          <div class="filters">
            <select formControlName="remoteType">
              <option value="">Any Remote Policy</option>
              <option value="REMOTE">Fully Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>

            <select formControlName="employmentType">
              <option value="">Any Employment Type</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>

            <input type="text" formControlName="location" placeholder="Location">
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="isLoading()">Search Jobs</button>
        </form>
      </section>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else {
        <div class="jobs-results">
          <h2>{{ jobs().length }} {{ jobs().length === 1 ? 'Job' : 'Jobs' }} Found</h2>
          
          <div class="jobs-grid">
            @for (job of jobs(); track job.id) {
              <div class="job-card" [routerLink]="['/jobs', job.slug]">
                <div class="company-logo">
                  @if (job.company?.logoUrl) {
                    <img [src]="job.company.logoUrl" [alt]="job.company.name">
                  } @else {
                    <div class="logo-placeholder">{{ job.company?.name?.charAt(0) }}</div>
                  }
                </div>
                
                <div class="job-info">
                  <h3>{{ job.title }}</h3>
                  <p class="company-name">{{ job.company?.name }}</p>
                  
                  <div class="tags">
                    <span class="tag">📍 {{ job.location || 'Remote' }}</span>
                    <span class="tag">💼 {{ job.employmentType }}</span>
                    <span class="tag">💰 {{ job.salaryMin | currency:job.currency:'symbol':'1.0-0' }} - {{ job.salaryMax | currency:job.currency:'symbol':'1.0-0' }}</span>
                  </div>
                </div>
                
                <div class="job-actions">
                  <span class="posted-date">Posted {{ job.publishedAt | date:'mediumDate' }}</span>
                  <button class="btn btn-secondary">View Details</button>
                </div>
              </div>
            }
          </div>
          
          @if (jobs().length === 0) {
            <div class="empty-state">
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters to find more opportunities.</p>
              <button class="btn btn-outline" (click)="resetFilters()">Clear Filters</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .job-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    
    .page-header {
      text-align: center;
      margin-bottom: var(--rp-space-10);
      
      h1 {
        font-size: 3rem;
        font-weight: 900;
        color: var(--rp-text-primary);
        letter-spacing: -0.02em;
        margin-bottom: var(--rp-space-3);
      }
      
      p {
        font-size: 1.25rem;
        color: var(--rp-text-secondary);
      }
    }

    .card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-xl);
      padding: var(--rp-space-6);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin-bottom: var(--rp-space-8);
    }

    .search-form {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
      
      input, select {
        padding: 12px 16px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
        font-family: var(--rp-font-sans);
        background: var(--rp-bg-secondary);
        
        &:focus {
          outline: none;
          border-color: var(--rp-primary);
          box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
        }
      }
    }

    .search-input {
      position: relative;
      
      .icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
        color: var(--rp-text-tertiary);
      }
      
      input {
        width: 100%;
        padding-left: 48px;
        font-size: 1.1rem;
        border-radius: var(--rp-radius-lg);
      }
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--rp-space-4);
    }

    .btn {
      padding: 12px 24px;
      border-radius: var(--rp-radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--rp-transition-fast);
      
      &.btn-primary {
        background: var(--rp-primary);
        color: white;
        &:hover { background: var(--rp-primary-600); }
      }
      
      &.btn-secondary {
        background: var(--rp-primary-50);
        color: var(--rp-primary-700);
        &:hover { background: var(--rp-primary-100); }
      }
      
      &.btn-outline {
        border: 1px solid var(--rp-border-light);
        background: transparent;
      }
    }

    .jobs-results h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: var(--rp-space-6);
    }

    .jobs-grid {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
    }

    .job-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      gap: var(--rp-space-6);
      align-items: center;
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        border-color: var(--rp-primary-200);
      }
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .company-logo {
      flex-shrink: 0;
      
      img, .logo-placeholder {
        width: 64px;
        height: 64px;
        border-radius: var(--rp-radius-md);
      }
      
      .logo-placeholder {
        background: var(--rp-gray-100);
        color: var(--rp-text-secondary);
        font-size: 1.5rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .job-info {
      flex: 1;
      
      h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--rp-space-1);
        color: var(--rp-text-primary);
      }
      
      .company-name {
        color: var(--rp-text-secondary);
        font-weight: 500;
        margin-bottom: var(--rp-space-3);
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--rp-space-3);
      
      .tag {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--rp-text-secondary);
        background: var(--rp-bg-secondary);
        padding: 4px 10px;
        border-radius: 100px;
      }
    }

    .job-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--rp-space-3);
      
      @media (max-width: 768px) {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      
      .posted-date {
        font-size: 0.85rem;
        color: var(--rp-text-tertiary);
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--rp-space-12) var(--rp-space-4);
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-xl);
      
      h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
      p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-6); }
    }
  `]
})
export class JobListComponent implements OnInit {
  isLoading = signal(true);
  jobs = signal<any[]>([]);
  filterForm: FormGroup;

  constructor(
    private jobService: JobService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      q: [''],
      remoteType: [''],
      employmentType: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading.set(true);
    const filters = this.filterForm.value;
    
    this.jobService.findAll(filters).subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    this.loadJobs();
  }

  resetFilters(): void {
    this.filterForm.reset({ q: '', remoteType: '', employmentType: '', location: '' });
    this.loadJobs();
  }
}
