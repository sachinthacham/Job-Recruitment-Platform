import { Component } from '@angular/core';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-shell">
      <div class="dashboard-placeholder">
        <h1>🎯 Recruiter Dashboard</h1>
        <p>Your recruitment pipeline will be implemented in Phase 4+</p>
      </div>
    </div>
  `,
  styles: `
    .dashboard-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--rp-bg-secondary);
    }
    .dashboard-placeholder {
      text-align: center;
      padding: var(--rp-space-10);
      h1 { margin-bottom: var(--rp-space-4); }
      p { color: var(--rp-text-secondary); }
    }
  `,
})
export class RecruiterDashboardComponent {}
