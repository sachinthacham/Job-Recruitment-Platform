import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="not-found-content animate-slide-up">
        <div class="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/" class="btn btn--primary">Back to Home</a>
      </div>
    </div>
  `,
  styles: `
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--rp-space-8);
    }

    .not-found-code {
      font-size: 8rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--rp-primary) 0%, var(--rp-accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: var(--rp-space-4);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: var(--rp-space-4);
    }

    p {
      font-size: 1.1rem;
      margin-bottom: var(--rp-space-8);
      color: var(--rp-text-secondary);
    }

    .btn {
      display: inline-flex;
      padding: var(--rp-space-3) var(--rp-space-8);
      border-radius: var(--rp-radius-md);
      font-weight: 600;
      text-decoration: none;
      transition: all 150ms ease;

      &--primary {
        background: var(--rp-primary);
        color: white;

        &:hover {
          background: var(--rp-primary-600);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 92, 231, 0.3);
        }
      }
    }
  `,
})
export class NotFoundComponent {}
