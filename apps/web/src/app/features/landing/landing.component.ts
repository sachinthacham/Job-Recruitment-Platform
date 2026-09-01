import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ─── Navigation ──────────────────────────────────── -->
    <nav class="landing-nav">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">
          <span class="logo-icon">&#9670;</span>
          <span class="logo-text">RecruitPro</span>
        </a>
        <div class="nav-links">
          <a routerLink="/jobs" class="nav-link">Browse Jobs</a>
          <a href="#features" class="nav-link">Features</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <a routerLink="/auth/login" class="nav-link">Sign In</a>
          <a routerLink="/auth/register" class="nav-btn nav-btn--primary">
            Get Started Free
          </a>
        </div>
      </div>
    </nav>

    <!-- ─── Hero ────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-bg-gradient"></div>
      <div class="hero-content">
        <div class="hero-badge animate-slide-up">
          <span class="badge badge--primary">🚀 Now in Beta</span>
        </div>
        <h1 class="hero-title animate-slide-up">
          Hire Smarter.<br/>
          <span class="hero-highlight">Grow Faster.</span>
        </h1>
        <p class="hero-subtitle animate-slide-up">
          The enterprise recruitment platform that connects top talent
          with exceptional companies. Streamline your hiring from job
          posting to offer acceptance.
        </p>
        <div class="hero-actions animate-slide-up">
          <a routerLink="/auth/register" class="btn btn--primary btn--lg">
            Start Recruiting — It's Free
          </a>
          <a routerLink="/jobs" class="btn btn--outline btn--lg">
            Browse Open Positions
          </a>
        </div>
        <div class="hero-stats animate-fade-in">
          <div class="stat">
            <span class="stat-value">12,000+</span>
            <span class="stat-label">Active Jobs</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">5,400+</span>
            <span class="stat-label">Companies</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">98%</span>
            <span class="stat-label">Satisfaction</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Features ────────────────────────────────────── -->
    <section class="features" id="features">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Why RecruitPro</span>
          <h2 class="section-title">Everything you need to hire the best</h2>
          <p class="section-subtitle">
            From sourcing to onboarding — a single platform for your entire recruitment lifecycle.
          </p>
        </div>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card card">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── How It Works ────────────────────────────────── -->
    <section class="how-it-works">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">How It Works</span>
          <h2 class="section-title">Three simple steps to your next hire</h2>
        </div>
        <div class="steps-grid">
          <div class="step">
            <div class="step-number">01</div>
            <h3 class="step-title">Post Your Job</h3>
            <p class="step-description">
              Create compelling job listings with our intelligent editor.
              Add screening questions and reach thousands of qualified candidates.
            </p>
          </div>
          <div class="step">
            <div class="step-number">02</div>
            <h3 class="step-title">Review & Interview</h3>
            <p class="step-description">
              Use our Kanban pipeline to manage candidates. Schedule
              interviews, collect feedback, and collaborate with your team.
            </p>
          </div>
          <div class="step">
            <div class="step-number">03</div>
            <h3 class="step-title">Hire Top Talent</h3>
            <p class="step-description">
              Send offers, track acceptances, and onboard new hires.
              Our analytics show you where to improve your process.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ─────────────────────────────────────────── -->
    <section class="cta">
      <div class="container">
        <div class="cta-card">
          <h2 class="cta-title">Ready to transform your hiring?</h2>
          <p class="cta-subtitle">
            Join thousands of companies already using RecruitPro to find
            and hire the best candidates.
          </p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="btn btn--primary btn--lg">
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Footer ──────────────────────────────────────── -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a routerLink="/" class="nav-logo">
              <span class="logo-icon">&#9670;</span>
              <span class="logo-text">RecruitPro</span>
            </a>
            <p class="footer-tagline">
              Enterprise recruitment platform for modern teams.
            </p>
          </div>
          <div class="footer-links">
            <h4>Platform</h4>
            <a routerLink="/jobs">Browse Jobs</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div class="footer-links">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
          <div class="footer-links">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 RecruitPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  readonly features = [
    {
      icon: '🎯',
      title: 'Smart Job Matching',
      description:
        'AI-powered recommendations connect candidates with roles that match their skills, experience, and career goals.',
    },
    {
      icon: '📊',
      title: 'Recruitment Pipeline',
      description:
        'Kanban-style board to manage candidates through every stage — from application to offer acceptance.',
    },
    {
      icon: '📅',
      title: 'Interview Scheduling',
      description:
        'Coordinate interviews across time zones. Automated reminders and feedback collection built in.',
    },
    {
      icon: '💬',
      title: 'In-App Messaging',
      description:
        'Real-time messaging between recruiters and candidates. Keep all communication in one place.',
    },
    {
      icon: '📈',
      title: 'Hiring Analytics',
      description:
        'Track time-to-hire, source performance, and conversion rates with beautiful dashboards.',
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description:
        'Multi-tenant isolation, RBAC, audit logs, and SOC 2-ready infrastructure to protect your data.',
    },
  ];
}
