import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="job-detail-container">
      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (job()) {
        <button class="btn-back" routerLink="/jobs">← Back to search</button>
        
        <div class="job-header card">
          <div class="company-logo">
            @if (job().company?.logoUrl) {
              <img [src]="job().company.logoUrl" [alt]="job().company.name">
            } @else {
              <div class="logo-placeholder">{{ job().company?.name?.charAt(0) }}</div>
            }
          </div>
          <div class="title-section">
            <h1>{{ job().title }}</h1>
            <p class="company-name">{{ job().company?.name }}</p>
          </div>
          <div class="action-section">
            @if (canApply()) {
              <button class="btn btn-primary btn-apply" [disabled]="isApplying()" (click)="apply()">
                {{ isApplying() ? 'Applying...' : 'Apply Now' }}
              </button>
            } @else if (hasApplied()) {
              <button class="btn btn-applied" disabled>✓ Applied</button>
            }
            @if (applyError()) {
              <p class="apply-error">{{ applyError() }}</p>
            }
            <p class="deadline" *ngIf="job().applicationDeadline">
              Closes {{ job().applicationDeadline | date }}
            </p>
          </div>
        </div>

        <div class="job-body">
          <div class="main-content">
            <section class="card">
              <h2>About the Role</h2>
              <p class="pre-line">{{ job().description }}</p>
            </section>
            
            <section class="card" *ngIf="job().responsibilities">
              <h2>Responsibilities</h2>
              <p class="pre-line">{{ job().responsibilities }}</p>
            </section>

            <section class="card" *ngIf="job().requirements">
              <h2>Requirements</h2>
              <p class="pre-line">{{ job().requirements }}</p>
            </section>
          </div>

          <div class="sidebar">
            <section class="card summary-card">
              <h3>Job Summary</h3>
              
              <div class="summary-item">
                <span class="icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <span>{{ job().location || 'Not specified' }}</span>
                </div>
              </div>
              
              <div class="summary-item">
                <span class="icon">💻</span>
                <div>
                  <strong>Workplace Type</strong>
                  <span>{{ job().remoteType }}</span>
                </div>
              </div>

              <div class="summary-item">
                <span class="icon">💼</span>
                <div>
                  <strong>Employment Type</strong>
                  <span>{{ job().employmentType }}</span>
                </div>
              </div>

              <div class="summary-item">
                <span class="icon">📈</span>
                <div>
                  <strong>Experience Level</strong>
                  <span>{{ job().experienceLevel }}</span>
                </div>
              </div>

              <div class="summary-item" *ngIf="job().salaryMin">
                <span class="icon">💰</span>
                <div>
                  <strong>Salary Range</strong>
                  <span>{{ job().salaryMin | currency:job().currency:'symbol':'1.0-0' }} - {{ job().salaryMax | currency:job().currency:'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </section>

            <section class="card skills-card" *ngIf="job().skills?.length">
              <h3>Required Skills</h3>
              <div class="skills-list">
                @for (skill of job().skills; track skill.id) {
                  <span class="skill-tag">{{ skill.skill.name }}</span>
                }
              </div>
            </section>
          </div>
        </div>
      } @else {
        <div class="error-state">
          <h2>Job not found</h2>
          <p>The job posting you are looking for does not exist or has been removed.</p>
          <button class="btn btn-primary" routerLink="/jobs">Browse Jobs</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .job-detail-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    
    .btn-back {
      background: none;
      border: none;
      color: var(--rp-text-secondary);
      font-weight: 600;
      cursor: pointer;
      margin-bottom: var(--rp-space-6);
      display: inline-block;
      
      &:hover { color: var(--rp-primary); }
    }

    .card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-xl);
      padding: var(--rp-space-8);
      margin-bottom: var(--rp-space-6);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .job-header {
      display: flex;
      gap: var(--rp-space-8);
      align-items: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
    }

    .company-logo {
      img, .logo-placeholder {
        width: 96px;
        height: 96px;
        border-radius: var(--rp-radius-lg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .logo-placeholder {
        background: var(--rp-gray-100);
        font-size: 2.5rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--rp-text-secondary);
      }
    }

    .title-section {
      flex: 1;
      
      h1 {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--rp-text-primary);
        line-height: 1.1;
        margin-bottom: var(--rp-space-2);
      }
      
      .company-name {
        font-size: 1.25rem;
        color: var(--rp-text-secondary);
        font-weight: 500;
      }
    }

    .action-section {
      text-align: right;
      
      @media (max-width: 768px) {
        width: 100%;
        text-align: left;
      }
      
      .btn-apply, .btn-applied {
        padding: 16px 32px;
        font-size: 1.1rem;
        width: 100%;
        margin-bottom: var(--rp-space-2);
      }

      .btn-applied {
        background: var(--rp-gray-100);
        color: var(--rp-text-secondary);
        border: none;
        border-radius: var(--rp-radius-md);
        font-weight: 600;
        cursor: not-allowed;
      }

      .apply-error {
        color: #dc2626;
        font-size: 0.85rem;
        margin-bottom: var(--rp-space-2);
      }

      .deadline {
        font-size: 0.85rem;
        color: var(--rp-text-tertiary);
      }
    }

    .job-body {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--rp-space-8);
      
      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }

    .main-content {
      h2 {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: var(--rp-space-4);
        padding-bottom: var(--rp-space-2);
        border-bottom: 2px solid var(--rp-gray-100);
      }
      
      .pre-line {
        white-space: pre-line;
        color: var(--rp-text-secondary);
        line-height: 1.7;
      }
    }

    .sidebar {
      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: var(--rp-space-5);
      }
    }

    .summary-item {
      display: flex;
      gap: var(--rp-space-4);
      margin-bottom: var(--rp-space-5);
      
      .icon {
        font-size: 1.5rem;
      }
      
      div {
        display: flex;
        flex-direction: column;
        
        strong { font-size: 0.9rem; color: var(--rp-text-tertiary); }
        span { font-weight: 600; color: var(--rp-text-primary); }
      }
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--rp-space-2);
      
      .skill-tag {
        background: var(--rp-primary-50);
        color: var(--rp-primary-700);
        padding: 6px 12px;
        border-radius: 100px;
        font-size: 0.85rem;
        font-weight: 600;
      }
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
    }

    .error-state {
      text-align: center;
      padding: 100px 20px;
      h2 { font-size: 2rem; margin-bottom: 10px; }
      p { color: var(--rp-text-secondary); margin-bottom: 30px; }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  isLoading = signal(true);
  job = signal<any>(null);
  isApplying = signal(false);
  hasApplied = signal(false);
  applyError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('idOrSlug');
    if (idOrSlug) {
      this.jobService.findOne(idOrSlug).subscribe({
        next: (data) => {
          this.job.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.router.navigate(['/jobs']);
    }
  }

  canApply(): boolean {
    return this.authService.hasRole('CANDIDATE') && !this.hasApplied();
  }

  apply(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.applyError.set(null);
    this.isApplying.set(true);

    this.applicationService.apply({ jobId: this.job().id }).subscribe({
      next: () => {
        this.hasApplied.set(true);
        this.isApplying.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isApplying.set(false);
        if (err.status === 409) {
          this.hasApplied.set(true);
        } else {
          this.applyError.set(err.error?.error?.message || 'Failed to submit application. Please try again.');
        }
      },
    });
  }
}
