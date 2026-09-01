import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../core/services/candidate.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-view-container">
      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (profile()) {
        <div class="profile-header card">
          <div class="profile-avatar">
            {{ profile().user?.firstName?.charAt(0) || 'C' }}
          </div>
          <div class="profile-title">
            <h1>{{ profile().user?.firstName }} {{ profile().user?.lastName }}</h1>
            <h2 class="headline">{{ profile().headline || 'No headline provided' }}</h2>
            <div class="meta">
              <span>📍 {{ profile().location || 'Unknown Location' }}</span>
              <span>📧 {{ profile().user?.email }}</span>
            </div>
          </div>
        </div>

        <div class="profile-body">
          <div class="main-column">
            <section class="card">
              <h3>About</h3>
              <p>{{ profile().bio || 'No bio provided' }}</p>
            </section>

            <!-- Experience and Education would go here in a full implementation -->
          </div>

          <div class="side-column">
            <section class="card">
              <h3>Skills</h3>
              <div class="skills-list">
                @for (skill of profile().skills; track skill.id) {
                  <span class="skill-tag">{{ skill.skill.name }}</span>
                }
                @if (!profile().skills?.length) {
                  <p class="empty-state">No skills added yet.</p>
                }
              </div>
            </section>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-view-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: var(--rp-space-8);
    }
    .card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-xl);
      padding: var(--rp-space-6);
      margin-bottom: var(--rp-space-6);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--rp-space-6);
    }
    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--rp-primary-100);
      color: var(--rp-primary);
      font-size: 3rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .profile-title h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--rp-text-primary);
    }
    .headline {
      font-size: 1.25rem;
      color: var(--rp-text-secondary);
      margin-bottom: var(--rp-space-2);
    }
    .meta {
      display: flex;
      gap: var(--rp-space-4);
      color: var(--rp-text-tertiary);
      font-size: 0.9rem;
    }
    .profile-body {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--rp-space-6);
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--rp-space-2);
    }
    .skill-tag {
      padding: 4px 10px;
      background: var(--rp-gray-100);
      color: var(--rp-text-secondary);
      border-radius: var(--rp-radius-sm);
      font-size: 0.85rem;
    }
    .empty-state {
      color: var(--rp-text-tertiary);
      font-style: italic;
    }
  `]
})
export class ProfileViewComponent implements OnInit {
  isLoading = signal(true);
  profile = signal<any>(null);

  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void {
    this.candidateService.getProfile().subscribe({
      next: (data: any) => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
