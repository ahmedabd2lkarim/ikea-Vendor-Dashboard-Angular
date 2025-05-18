import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiService } from './ui.service';
import { SomeService } from './some.service';
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .success-snackbar {
      background: #28a745;
      color: white;
    }

    .error-snackbar {
      background: #dc3545;
      color: white;
    }

    .mat-mdc-snack-bar-container {
      &.success-snackbar, &.error-snackbar {
        button {
          color: white;
        }
      }
    }
  `]
})
export class LoadingSpinnerComponent {}

// Example usage in a component
@Component({
  // ...
  template: `
    <app-loading-spinner *ngIf="uiService.loading$ | async"></app-loading-spinner>
    <div class="content">
      <!-- Component content -->
    </div>
  `
})
export class SomeComponent {
  constructor(
    public uiService: UiService,
    private someService: SomeService
  ) {}

  performAction() {
    this.uiService.showLoading();
    this.someService.doSomething().subscribe({
      next: (result) => {
        this.uiService.hideLoading();
        this.uiService.showSuccess('Action completed successfully');
      },
      error: () => this.uiService.hideLoading()
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  showLoading() {
    this.loadingSubject.next(true);
  }

  hideLoading() {
    this.loadingSubject.next(false);
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}