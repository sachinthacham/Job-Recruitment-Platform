import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-side-panel">
        <div class="side-content">
          <div class="side-logo">
            <span class="logo-icon">&#9670;</span>
            <span class="logo-text">RecruitPro</span>
          </div>
          <h2>Secure your <br><span class="gradient-text">account</span></h2>
          <p>Choose a strong password to keep your RecruitPro account safe.</p>
        </div>
        <div class="side-decoration">
          <div class="floating-shape shape-2"></div>
        </div>
      </div>

      <!-- Reset Form -->
      <div class="auth-form-panel">
        <div class="auth-card animate-slide-up">
          <div class="auth-header">
            <a routerLink="/" class="auth-logo mobile-logo">
              <span class="logo-icon">&#9670;</span>
              <span class="logo-text">RecruitPro</span>
            </a>
            <h1>Set new password</h1>
            <p>Please enter your new password below.</p>
          </div>

          @if (isSuccess()) {
            <div class="alert alert-success animate-slide-up" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>{{ successMessage() }}</span>
            </div>
            
            <div class="auth-footer mt-4" style="margin-top: 2rem;">
              <a routerLink="/auth/login" class="btn btn-primary btn-full" style="text-decoration: none;">Continue to Sign In</a>
            </div>
          } @else if (invalidToken()) {
            <div class="alert alert-error animate-slide-up">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>Invalid or missing reset token. Please request a new password reset link.</span>
            </div>
            
            <div class="auth-footer mt-4" style="margin-top: 2rem;">
              <a routerLink="/auth/forgot-password" class="btn btn-primary btn-full" style="text-decoration: none;">Request New Link</a>
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

            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="auth-form">
              <!-- New Password -->
              <div class="form-group" [class.has-error]="showError('newPassword')" [class.has-value]="resetForm.get('newPassword')?.value">
                <label for="reset-password" class="form-label">New Password</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                  </svg>
                  <input
                    id="reset-password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showPassword.set(!showPassword())"
                    tabindex="-1"
                  >
                    @if (showPassword()) {
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                    } @else {
                      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                    }
                  </button>
                </div>
                
                <!-- Password Strength Indicator -->
                @if (resetForm.get('newPassword')?.value) {
                  <div class="password-strength">
                    <div class="strength-bars">
                      <div class="bar" [class.active]="passwordStrength() >= 1" [class]="strengthClass()"></div>
                      <div class="bar" [class.active]="passwordStrength() >= 2" [class]="strengthClass()"></div>
                      <div class="bar" [class.active]="passwordStrength() >= 3" [class]="strengthClass()"></div>
                      <div class="bar" [class.active]="passwordStrength() >= 4" [class]="strengthClass()"></div>
                    </div>
                    <span class="strength-text" [class]="strengthClass()">{{ strengthLabel() }}</span>
                  </div>
                }
                
                @if (showError('newPassword') && resetForm.get('newPassword')?.errors?.['minlength']) {
                  <span class="form-error">Password must be at least 8 characters</span>
                }
              </div>

              <!-- Confirm Password -->
              <div class="form-group" [class.has-error]="showError('confirmPassword') || (resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched)" [class.has-value]="resetForm.get('confirmPassword')?.value">
                <label for="reset-confirm" class="form-label">Confirm New Password</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                  </svg>
                  <input
                    id="reset-confirm"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="Confirm new password"
                  />
                </div>
                @if (resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched) {
                  <span class="form-error">Passwords do not match</span>
                }
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-primary btn-full mt-2"
                [disabled]="isLoading() || resetForm.invalid"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  Resetting password...
                } @else {
                  Reset Password
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../register/register.component.scss', '../login/login.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  invalidToken = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  token = '';

  // Password strength signal
  passwordStrength = computed(() => {
    const password = this.resetForm.get('newPassword')?.value || '';
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    
    return strength;
  });

  strengthClass = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  });

  strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s === 0) return '';
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.invalidToken.set(true);
    }
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  showError(field: string): boolean {
    const control = this.resetForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const newPassword = this.resetForm.value.newPassword;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.successMessage.set(res.message);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.error?.message || 'Failed to reset password. The link might be expired.'
        );
      }
    });
  }
}
