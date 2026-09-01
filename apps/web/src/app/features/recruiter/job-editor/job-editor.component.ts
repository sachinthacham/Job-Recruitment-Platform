import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-job-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="job-editor-container">
      <header class="editor-header">
        <h1>{{ isEditMode() ? 'Edit Job' : 'Post New Job' }}</h1>
        <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else {
        <section class="card">
          <form [formGroup]="jobForm" (ngSubmit)="saveJob()" class="form-grid">
            <div class="form-group full-width">
              <label>Job Title</label>
              <input type="text" formControlName="title" placeholder="e.g. Senior Software Engineer">
            </div>
            
            <div class="form-group full-width">
              <label>Job Description</label>
              <textarea formControlName="description" rows="6" placeholder="Describe the role..."></textarea>
            </div>

            <div class="form-group">
              <label>Employment Type</label>
              <select formControlName="employmentType">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div class="form-group">
              <label>Remote Policy</label>
              <select formControlName="remoteType">
                <option value="ON_SITE">On Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Fully Remote</option>
              </select>
            </div>

            <div class="form-group">
              <label>Experience Level</label>
              <select formControlName="experienceLevel">
                <option value="INTERNSHIP">Internship</option>
                <option value="ENTRY_LEVEL">Entry Level</option>
                <option value="ASSOCIATE">Associate</option>
                <option value="MID_SENIOR">Mid-Senior</option>
                <option value="DIRECTOR">Director</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div class="form-group">
              <label>Location</label>
              <input type="text" formControlName="location" placeholder="City, Country">
            </div>

            <div class="form-group">
              <label>Minimum Salary</label>
              <input type="number" formControlName="salaryMin" placeholder="e.g. 80000">
            </div>
            <div class="form-group">
              <label>Maximum Salary</label>
              <input type="number" formControlName="salaryMax" placeholder="e.g. 120000">
            </div>

            <div class="form-group">
              <label>Currency</label>
              <select formControlName="currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="LKR">LKR</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select formControlName="status">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn btn-primary" [disabled]="jobForm.invalid || isSaving()">
                {{ isSaving() ? 'Saving...' : (isEditMode() ? 'Update Job' : 'Post Job') }}
              </button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
  styleUrls: ['./job-editor.component.scss']
})
export class JobEditorComponent implements OnInit {
  isLoading = signal(true);
  isSaving = signal(false);
  isEditMode = signal(false);
  jobId: string | null = null;
  jobForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      employmentType: ['FULL_TIME'],
      remoteType: ['ON_SITE'],
      experienceLevel: ['MID_SENIOR'],
      location: [''],
      salaryMin: [null],
      salaryMax: [null],
      currency: ['USD'],
      status: ['DRAFT']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.jobId = id;
      this.jobService.findOne(id).subscribe({
        next: (job: any) => {
          this.jobForm.patchValue(job);
          this.isLoading.set(false);
        },
        error: () => {
          this.router.navigate(['/recruiter/jobs']);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  saveJob(): void {
    if (this.jobForm.invalid) return;
    this.isSaving.set(true);
    
    const obs$ = this.isEditMode() && this.jobId
      ? this.jobService.update(this.jobId, this.jobForm.value)
      : this.jobService.create(this.jobForm.value);

    obs$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/recruiter/jobs']);
      },
      error: () => this.isSaving.set(false)
    });
  }

  goBack(): void {
    this.router.navigate(['/recruiter/jobs']);
  }
}
