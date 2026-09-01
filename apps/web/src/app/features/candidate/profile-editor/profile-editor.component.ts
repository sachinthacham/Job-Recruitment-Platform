import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-editor-container">
      <header class="editor-header">
        <h1>Edit Profile</h1>
        <p>Update your details, experience, education, and skills.</p>
      </header>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
      } @else {
        <div class="editor-sections">
          
          <!-- Basic Info Section -->
          <section class="editor-section card">
            <div class="section-header">
              <h2>Basic Information</h2>
            </div>
            <form [formGroup]="basicInfoForm" (ngSubmit)="saveBasicInfo()" class="form-grid">
              <div class="form-group">
                <label>Headline</label>
                <input type="text" formControlName="headline" placeholder="e.g. Senior Frontend Developer">
              </div>
              <div class="form-group full-width">
                <label>Bio</label>
                <textarea formControlName="bio" rows="4" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div class="form-group">
                <label>Location</label>
                <input type="text" formControlName="location" placeholder="City, Country">
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="text" formControlName="phone" placeholder="+1 234 567 8900">
              </div>
              <div class="form-group">
                <label>LinkedIn URL</label>
                <input type="url" formControlName="linkedinUrl" placeholder="https://linkedin.com/in/...">
              </div>
              <div class="form-group">
                <label>GitHub URL</label>
                <input type="url" formControlName="githubUrl" placeholder="https://github.com/...">
              </div>
              <div class="form-actions full-width">
                <button type="submit" class="btn btn-primary" [disabled]="basicInfoForm.invalid || isSaving()">
                  {{ isSaving() ? 'Saving...' : 'Save Basic Info' }}
                </button>
              </div>
            </form>
          </section>

          <!-- Skills Section -->
          <section class="editor-section card">
            <div class="section-header">
              <h2>Skills</h2>
            </div>
            
            <div class="skills-list">
              @for (skill of profileData()?.skills; track skill.skill.id) {
                <div class="skill-tag">
                  <span>{{ skill.skill.name }} ({{ skill.level }})</span>
                  <button class="btn-remove" (click)="removeSkill(skill.skill.id)">&times;</button>
                </div>
              }
            </div>

            <form [formGroup]="skillForm" (ngSubmit)="addSkill()" class="add-item-form">
              <input type="text" formControlName="name" placeholder="E.g. Angular, TypeScript">
              <select formControlName="level">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
              <input type="number" formControlName="yearsOfExperience" placeholder="Years" min="0">
              <button type="submit" class="btn btn-secondary" [disabled]="skillForm.invalid || isSaving()">Add Skill</button>
            </form>
          </section>

        </div>
      }
    </div>
  `,
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {
  isLoading = signal(true);
  isSaving = signal(false);
  profileData = signal<any>(null);

  basicInfoForm: FormGroup;
  skillForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService
  ) {
    this.basicInfoForm = this.fb.group({
      headline: [''],
      bio: [''],
      location: [''],
      phone: [''],
      linkedinUrl: [''],
      githubUrl: ['']
    });

    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      level: ['INTERMEDIATE', Validators.required],
      yearsOfExperience: [null]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.candidateService.getProfile().subscribe({
      next: (data: any) => {
        this.profileData.set(data);
        this.basicInfoForm.patchValue({
          headline: data.headline,
          bio: data.bio,
          location: data.location,
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  saveBasicInfo(): void {
    if (this.basicInfoForm.invalid) return;
    this.isSaving.set(true);
    this.candidateService.updateProfile(this.basicInfoForm.value).subscribe({
      next: (data: any) => {
        this.profileData.set({...this.profileData(), ...data});
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }

  addSkill(): void {
    if (this.skillForm.invalid) return;
    this.isSaving.set(true);
    this.candidateService.addSkill(this.skillForm.value).subscribe({
      next: () => {
        this.skillForm.reset({ level: 'INTERMEDIATE' });
        this.loadProfile(); // reload to get the new skill list
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }

  removeSkill(id: string): void {
    this.isSaving.set(true);
    this.candidateService.removeSkill(id).subscribe({
      next: () => {
        this.loadProfile();
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }
}
