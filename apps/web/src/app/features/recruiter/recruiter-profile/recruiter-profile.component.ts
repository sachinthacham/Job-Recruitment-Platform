import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RecruiterService } from '../../../core/services/recruiter.service';

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="recruiter-profile-container">
      <header class="editor-header">
        <h1>My Profile</h1>
        <p>Update your personal recruiter details.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else {
        <section class="card">
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-grid">
            <div class="form-group">
              <label>Job Title</label>
              <input type="text" formControlName="title" placeholder="e.g. Senior Technical Recruiter">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" formControlName="phone" placeholder="+1 234 567 8900">
            </div>
            <div class="form-group full-width">
              <label>Bio</label>
              <textarea formControlName="bio" rows="4" placeholder="Tell candidates about yourself..."></textarea>
            </div>
            
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save Profile' }}
              </button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
  styles: [`
    .recruiter-profile-container {
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
  `]
})
export class RecruiterProfileComponent implements OnInit {
  isLoading = signal(true);
  isSaving = signal(false);
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private recruiterService: RecruiterService
  ) {
    this.profileForm = this.fb.group({
      title: [''],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.recruiterService.getProfile().subscribe({
      next: (data: any) => {
        this.profileForm.patchValue({
          title: data.title,
          phone: data.phone,
          bio: data.bio
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving.set(true);
    this.recruiterService.updateProfile(this.profileForm.value).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }
}
