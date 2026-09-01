import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Interfaces ──────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'CANDIDATE' | 'RECRUITER';
}

// ─── Constants ───────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private isRefreshing = false;

  /** Observable stream of the current user (null if not logged in) */
  readonly currentUser$ = this.currentUserSubject.asObservable();

  /** Angular signal for the current user */
  readonly currentUser = signal<AuthUser | null>(null);

  /** Computed signal: whether user is authenticated */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.loadStoredUser();
  }

  // ─── Auth Actions ──────────────────────────────────────

  /**
   * Login with email and password.
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => throwError(() => error)),
    );
  }

  /**
   * Register a new user.
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => throwError(() => error)),
    );
  }

  /**
   * Logout and revoke refresh token.
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/logout`, { refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh the access token using the stored refresh token.
   */
  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('No refresh token'));
    }

    if (this.isRefreshing) {
      return throwError(() => new Error('Refresh already in progress'));
    }

    this.isRefreshing = true;

    return this.http
      .post<AuthTokens>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this.storeTokens(tokens);
          this.isRefreshing = false;
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.clearAuth();
          return throwError(() => error);
        }),
      );
  }

  /**
   * Fetch the current user profile from the API.
   */
  fetchCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.setUser(user)),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      }),
    );
  }

  /**
   * Request a password reset email.
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password using a token.
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * Change the current user's password.
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  // ─── Token Access ──────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // ─── Role Checks ──────────────────────────────────────

  getUserRoles(): string[] {
    return this.currentUser()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(...roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Get the default dashboard route based on user's primary role.
   */
  getDefaultRoute(): string {
    if (this.hasRole('PLATFORM_ADMIN')) return '/admin';
    if (this.hasRole('RECRUITER') || this.hasRole('COMPANY_ADMIN') || this.hasRole('HIRING_MANAGER')) {
      return '/recruiter';
    }
    return '/candidate';
  }

  // ─── Private ───────────────────────────────────────────

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeTokens(response.tokens);
    this.setUser(response.user);
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private setUser(user: AuthUser): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem(USER_KEY);
    const token = this.getAccessToken();

    if (stored && token) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
      } catch {
        this.clearAuth();
      }
    }
  }
}
