import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Decorative Side Panel -->
      <div class="auth-side-panel">
        <div class="side-content">
          <div class="side-logo">
            <span class="logo-icon">&#9670;</span>
            <span class="logo-text">RecruitPro</span>
          </div>
          <h2>Find your next<br><span class="gradient-text">great opportunity</span></h2>
          <p>Join thousands of professionals using RecruitPro to advance their careers and build exceptional teams.</p>
          <div class="side-stats">
            <div class="stat">
              <span class="stat-value">50K+</span>
              <span class="stat-label">Active Jobs</span>
            </div>
            <div class="stat">
              <span class="stat-value">12K+</span>
              <span class="stat-label">Companies</span>
            </div>
            <div class="stat">
              <span class="stat-value">200K+</span>
              <span class="stat-label">Candidates</span>
            </div>
          </div>
        </div>
        <div class="side-decoration">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-2"></div>
          <div class="floating-shape shape-3"></div>
        </div>
      </div>

      <!-- Login Form -->
      <div class="auth-form-panel">
        <div class="auth-card animate-slide-up">
          <div class="auth-header">
            <a routerLink="/" class="auth-logo mobile-logo">
              <span class="logo-icon">&#9670;</span>
              <span class="logo-text">RecruitPro</span>
            </a>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="alert alert-error animate-slide-up" id="login-error">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Email -->
            <div class="form-group" [class.has-error]="showError('email')" [class.has-value]="loginForm.get('email')?.value">
              <label for="login-email" class="form-label">Email address</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  formControlName="email"
                  placeholder="you&#64;example.com"
                  autocomplete="email"
                />
              </div>
              @if (showError('email')) {
                <span class="form-error">Please enter a valid email address</span>
              }
            </div>

            <!-- Password -->
            <div class="form-group" [class.has-error]="showError('password')" [class.has-value]="loginForm.get('password')?.value">
              <label for="login-password" class="form-label">Password</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
                <input
                  id="login-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                  } @else {
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                  }
                </button>
              </div>
              @if (showError('password')) {
                <span class="form-error">Password is required</span>
              }
            </div>

            <!-- Remember / Forgot -->
            <div class="form-row">
              <label class="checkbox-label" for="login-remember">
                <input type="checkbox" id="login-remember" formControlName="rememberMe" />
                <span class="checkmark"></span>
                Remember me
              </label>
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary btn-full"
              [disabled]="isLoading()"
              id="login-submit"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Signing in...
              } @else {
                Sign in
              }
            </button>
          </form>

          <div class="auth-divider">
            <span>or</span>
          </div>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/auth/register">Create one for free</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Navigate to the return URL or the user's default dashboard
        const target = this.returnUrl !== '/' ? this.returnUrl : this.authService.getDefaultRoute();
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.error?.message || 'Invalid email or password. Please try again.',
        );
      },
    });
  }
}
