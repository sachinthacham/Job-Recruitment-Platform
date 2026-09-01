import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2>Join the <br><span class="gradient-text">future of hiring</span></h2>
          <p>Create an account to connect with top talent or find your dream job.</p>
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>
              <span>Smart matching algorithms</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>
              <span>Automated screening</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>
              <span>End-to-end interview management</span>
            </div>
          </div>
        </div>
        <div class="side-decoration">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-2"></div>
        </div>
      </div>

      <!-- Register Form -->
      <div class="auth-form-panel">
        <div class="auth-card animate-slide-up">
          <div class="auth-header">
            <a routerLink="/" class="auth-logo mobile-logo">
              <span class="logo-icon">&#9670;</span>
              <span class="logo-text">RecruitPro</span>
            </a>
            <h1>Create an account</h1>
            <p>Start your journey with RecruitPro today</p>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="alert alert-error animate-slide-up">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Role Selection -->
            <div class="role-selector">
              <label class="role-option" [class.selected]="registerForm.get('role')?.value === 'CANDIDATE'">
                <input type="radio" formControlName="role" value="CANDIDATE" class="sr-only">
                <div class="role-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
                </div>
                <div class="role-info">
                  <span class="role-title">I'm a Candidate</span>
                  <span class="role-desc">Looking for opportunities</span>
                </div>
              </label>
              <label class="role-option" [class.selected]="registerForm.get('role')?.value === 'RECRUITER'">
                <input type="radio" formControlName="role" value="RECRUITER" class="sr-only">
                <div class="role-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>
                </div>
                <div class="role-info">
                  <span class="role-title">I'm a Recruiter</span>
                  <span class="role-desc">Hiring top talent</span>
                </div>
              </label>
            </div>

            <div class="form-row-2">
              <!-- First Name -->
              <div class="form-group" [class.has-error]="showError('firstName')" [class.has-value]="registerForm.get('firstName')?.value">
                <label for="reg-firstname" class="form-label">First Name</label>
                <div class="input-wrapper">
                  <input
                    id="reg-firstname"
                    type="text"
                    formControlName="firstName"
                    placeholder="John"
                  />
                </div>
                @if (showError('firstName')) {
                  <span class="form-error">Required</span>
                }
              </div>

              <!-- Last Name -->
              <div class="form-group" [class.has-error]="showError('lastName')" [class.has-value]="registerForm.get('lastName')?.value">
                <label for="reg-lastname" class="form-label">Last Name</label>
                <div class="input-wrapper">
                  <input
                    id="reg-lastname"
                    type="text"
                    formControlName="lastName"
                    placeholder="Doe"
                  />
                </div>
                @if (showError('lastName')) {
                  <span class="form-error">Required</span>
                }
              </div>
            </div>

            <!-- Email -->
            <div class="form-group" [class.has-error]="showError('email')" [class.has-value]="registerForm.get('email')?.value">
              <label for="reg-email" class="form-label">Email address</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <input
                  id="reg-email"
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
            <div class="form-group" [class.has-error]="showError('password')" [class.has-value]="registerForm.get('password')?.value">
              <label for="reg-password" class="form-label">Password</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
                <input
                  id="reg-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Create a strong password"
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
              @if (registerForm.get('password')?.value) {
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
              
              @if (showError('password') && registerForm.get('password')?.errors?.['minlength']) {
                <span class="form-error">Password must be at least 8 characters</span>
              }
            </div>

            <!-- Confirm Password -->
            <div class="form-group" [class.has-error]="showError('confirmPassword') || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)" [class.has-value]="registerForm.get('confirmPassword')?.value">
              <label for="reg-confirm-password" class="form-label">Confirm Password</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 20 20" fill="currentColor" class="input-icon">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
                <input
                  id="reg-confirm-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                />
              </div>
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                <span class="form-error">Passwords do not match</span>
              }
            </div>
            
            <div class="terms-row">
              <label class="checkbox-label" for="reg-terms">
                <input type="checkbox" id="reg-terms" formControlName="agreeToTerms" />
                <span class="checkmark"></span>
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
              @if (showError('agreeToTerms')) {
                <span class="form-error d-block mt-1">You must agree to the terms to continue</span>
              }
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary btn-full"
              [disabled]="isLoading() || registerForm.invalid"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Creating account...
              } @else {
                Create account
              }
            </button>
          </form>

          <div class="auth-divider">
            <span>or</span>
          </div>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss', '../login/login.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  // Password strength signal
  passwordStrength = computed(() => {
    const password = this.registerForm.get('password')?.value || '';
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
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      role: ['CANDIDATE', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  showError(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formValues = this.registerForm.value;

    this.authService.register({
      email: formValues.email,
      password: formValues.password,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      role: formValues.role,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.authService.getDefaultRoute());
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.error?.message || 'Registration failed. Please try again.',
        );
      },
    });
  }
}
