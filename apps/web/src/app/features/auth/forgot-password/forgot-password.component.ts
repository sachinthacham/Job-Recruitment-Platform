import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
          <h2>Reset your <br><span class="gradient-text">password</span></h2>
          <p>Don't worry, it happens to the best of us. We'll help you get back into your account.</p>
        </div>
        <div class="side-decoration">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-3"></div>
        </div>
      </div>

      <!-- Forgot Password Form -->
      <div class="auth-form-panel">
        <div class="auth-card animate-slide-up">
          <div class="auth-header">
            <a routerLink="/" class="auth-logo mobile-logo">
              <span class="logo-icon">&#9670;</span>
              <span class="logo-text">RecruitPro</span>
            </a>
            <h1>Forgot password?</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          @if (isSuccess()) {
            <div class="alert alert-success animate-slide-up" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>{{ successMessage() }}</span>
            </div>
            
            <div class="auth-footer mt-4" style="margin-top: 2rem;">
              <a routerLink="/auth/login" class="btn btn-primary btn-full" style="text-decoration: none;">Back to Sign In</a>
            </div>
          } @else {
            @if (errorMessage()) {
              <div class="alert alert-error animate-slide-up">
                <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form">
              <!-- Email -->
              <div class="form-group" [class.has-error]="showError('email')" [class.has-value]="forgotForm.get('email')?.value">
                <label for="forgot-email" class="form-label">Email address</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <input
                    id="forgot-email"
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

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-primary btn-full mt-2"
                [disabled]="isLoading() || forgotForm.invalid"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  Sending link...
                } @else {
                  Send Reset Link
                }
              </button>
            </form>

            <div class="auth-footer mt-4" style="margin-top: 1.5rem;">
              <p>Remember your password? <a routerLink="/auth/login">Back to Sign In</a></p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  showError(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.successMessage.set(res.message);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.error?.message || 'Failed to send reset link. Please try again later.'
        );
      }
    });
  }
}
