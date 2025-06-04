import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Vendor Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email"
            />
            <div
              *ngIf="
                loginForm.get('email')?.touched &&
                loginForm.get('email')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="loginForm.get('email')?.errors?.['required']"
                >Email is required</span
              >
              <span *ngIf="loginForm.get('email')?.errors?.['email']"
                >Please enter a valid email</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              placeholder="Enter your password"
            />
            <div
              *ngIf="
                loginForm.get('password')?.touched &&
                loginForm.get('password')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="loginForm.get('password')?.errors?.['required']"
                >Password is required</span
              >
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']"
                >Password must be at least 6 characters</span
              >
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="register-link">
            Don't have an account? <a routerLink="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 20px;
      }

      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        color: #333;
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .submit-btn {
        width: 100%;
        padding: 0.75rem;
        background-color: #0051ba;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      .submit-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      .submit-btn:hover:not(:disabled) {
        background-color: #003d8e;
      }

      .register-link {
        text-align: center;
        margin-top: 1rem;
      }

      .register-link a {
        color: #0051ba;
        text-decoration: none;
      }

      .register-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
  host: {
    class: 'auth-page',
  },
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          console.log(email, password);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isLoading = false;
        },
      });
    }
  }
}
