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
              [class.is-invalid]="
                hasError('mobileNumber', 'required') ||
                hasError('mobileNumber', 'pattern')
              "
              placeholder="Enter your mobile number (11 digits)"
            />
            <div
              class="error-message"
              *ngIf="registerForm.get('mobileNumber')?.touched"
            >
              {{ getErrorMessage('mobileNumber') }}
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

      .is-invalid {
        border-color: #dc3545;
        padding-right: calc(1.5em + 0.75rem);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
      }

      .error-message {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 0.875em;
        color: #dc3545;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      storeAddress: ['', Validators.required],
      mobileNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^01[0-2|5]{1}[0-9]{8}$') // More precise Egyptian number pattern
        ],
      ],
      role: ['vendor'],
    });
  }

  // Helper methods for form validation
  hasError(controlName: string, errorType: string): boolean {
    const control = this.registerForm?.get(controlName);
    if (!control) return false;

    if (controlName === 'mobileNumber') {
      const value = control.value;
      if (errorType === 'pattern') {
        // Check specific mobile number format issues
        if (!value) return false;
        if (value.length !== 11) return true;
        if (!value.startsWith('01')) return true;
        // Check if it's a valid Egyptian prefix (010, 011, 012, 015)
        const prefix = value.substring(0, 3);
        if (!['010', '011', '012', '015'].includes(prefix)) return true;
      }
    }

    return control.touched && control.errors?.[errorType] === true;
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm?.get(controlName);
    if (!control?.errors) return '';

    if (controlName === 'mobileNumber') {
      const value = control.value;
      if (!value) return 'Mobile number is required';
      if (value && !value.startsWith('01')) return 'Must start with 01';
      if (value && value.length !== 11) return 'Must be 11 digits';
      if (value) {
        const prefix = value.substring(0, 3);
        if (!['010', '011', '012', '015'].includes(prefix)) {
          return 'Must start with 010, 011, 012, or 015';
        }
      }
    }

    const errors: Record<string, string> = {
      required: 'This field is required',
      pattern: 'Please enter a valid Egyptian mobile number (e.g., 01012345678)',
    };

    const firstError = Object.keys(control.errors)[0];
    return errors[firstError] || 'Invalid input';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const formData = {
      ...this.registerForm.value,
      role: 'vendor', // Ensure role is set even if form field is missing
    };

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        const errorMessage =
          error.error?.message ||
          'Registration failed. Please try again.';
        // Add error display logic here (e.g., using MatSnackBar)
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
