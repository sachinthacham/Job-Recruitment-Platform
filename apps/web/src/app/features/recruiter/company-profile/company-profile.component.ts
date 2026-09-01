import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { RecruiterService } from '../../../core/services/recruiter.service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="company-profile-container">
      <header class="editor-header">
        <h1>Company Profile</h1>
        <p>Manage your company's public information.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (companyId()) {
        <section class="card">
          <form [formGroup]="companyForm" (ngSubmit)="saveCompany()" class="form-grid">
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" formControlName="name">
            </div>
            <div class="form-group">
              <label>Website</label>
              <input type="url" formControlName="website">
            </div>
            <div class="form-group">
              <label>Industry</label>
              <input type="text" formControlName="industry">
            </div>
            <div class="form-group">
              <label>Location</label>
              <input type="text" formControlName="location">
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea formControlName="description" rows="4"></textarea>
            </div>
            
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-primary" [disabled]="companyForm.invalid || isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save Company Details' }}
              </button>
            </div>
          </form>
        </section>
      } @else {
        <div class="alert">
          You are not currently associated with a company. Please contact your platform administrator.
        </div>
      }
    </div>
  `,
  styles: [`
    .company-profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--rp-space-8);
    }
    .editor-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; color: var(--rp-text-primary); }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-xl);
      padding: var(--rp-space-6);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--rp-space-5);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-2);
      &.full-width { grid-column: 1 / -1; }
      label { font-size: 0.875rem; font-weight: 600; }
      input, textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
        font-family: var(--rp-font-sans);
      }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    .btn {
      padding: 10px 20px;
      border-radius: var(--rp-radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .btn-primary { background: var(--rp-primary); color: white; }
    .alert { padding: 20px; background: var(--rp-gray-100); border-radius: 8px; }
  `]
})
export class CompanyProfileComponent implements OnInit {
  isLoading = signal(true);
  isSaving = signal(false);
  companyId = signal<string | null>(null);
  companyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private recruiterService: RecruiterService
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      website: [''],
      industry: [''],
      location: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    // First get the recruiter profile to know which company they belong to
    this.recruiterService.getProfile().subscribe({
      next: (recruiter: any) => {
        if (recruiter.companyId) {
          this.companyId.set(recruiter.companyId);
          this.loadCompany(recruiter.companyId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadCompany(id: string): void {
    this.companyService.findOne(id).subscribe({
      next: (company: any) => {
        this.companyForm.patchValue({
          name: company.name,
          website: company.website,
          industry: company.industry,
          location: company.location,
          description: company.description
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveCompany(): void {
    const id = this.companyId();
    if (this.companyForm.invalid || !id) return;
    
    this.isSaving.set(true);
    this.companyService.update(id, this.companyForm.value).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }
}
