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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Vendor Registration</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="form-control"
              placeholder="Enter your full name"
            />
            <div
              *ngIf="
                registerForm.get('name')?.touched &&
                registerForm.get('name')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="registerForm.get('name')?.errors?.['required']"
                >Name is required</span
              >
            </div>
          </div>

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
                registerForm.get('email')?.touched &&
                registerForm.get('email')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="registerForm.get('email')?.errors?.['required']"
                >Email is required</span
              >
              <span *ngIf="registerForm.get('email')?.errors?.['email']"
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
                registerForm.get('password')?.touched &&
                registerForm.get('password')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="registerForm.get('password')?.errors?.['required']"
                >Password is required</span
              >
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']"
                >Password must be at least 6 characters</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="storeName">Store Name</label>
            <input
              type="text"
              id="storeName"
              formControlName="storeName"
              class="form-control"
              placeholder="Enter your store name"
            />
            <div
              *ngIf="
                registerForm.get('storeName')?.touched &&
                registerForm.get('storeName')?.invalid
              "
              class="error-message"
            >
              <span *ngIf="registerForm.get('storeName')?.errors?.['required']"
                >Store name is required</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="storeAddress">Store Address</label>
            <textarea
              id="storeAddress"
              formControlName="storeAddress"
              class="form-control"
              placeholder="Enter your store address"
              rows="3"
            ></textarea>
            <div
              *ngIf="
                registerForm.get('storeAddress')?.touched &&
                registerForm.get('storeAddress')?.invalid
              "
              class="error-message"
            >
              <span
                *ngIf="registerForm.get('storeAddress')?.errors?.['required']"
                >Store address is required</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="mobileNumber">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              formControlName="mobileNumber"
              class="form-control"
              placeholder="Enter your mobile number"
            />
            <div
              *ngIf="
                registerForm.get('mobileNumber')?.touched &&
                registerForm.get('mobileNumber')?.invalid
              "
              class="error-message"
            >
              <span
                *ngIf="registerForm.get('mobileNumber')?.errors?.['required']"
                >Mobile number is required</span
              >
              <span
                *ngIf="registerForm.get('mobileNumber')?.errors?.['pattern']"
                >Please enter a valid mobile number</span
              >
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>

          <div class="login-link">
            Already have an account? <a routerLink="/login">Login here</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 20px;
      }

      .register-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 500px;
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

      textarea.form-control {
        resize: vertical;
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

      .login-link {
        text-align: center;
        margin-top: 1rem;
      }

      .login-link a {
        color: #0051ba;
        text-decoration: none;
      }

      .login-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      storeName: ['', Validators.required],
      storeAddress: ['', Validators.required],
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isLoading = false;
        },
      });
    }
  }
}
