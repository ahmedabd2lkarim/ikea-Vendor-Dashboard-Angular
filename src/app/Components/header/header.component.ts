import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { VendorProfileService } from '../../Services/vendor-profile.service';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, RouterModule, CommonModule],
  template: `
    <div class="inside" *ngIf="shouldShowHeader()">
      <div class="dropdown">
        <button class="btn btn-outline-dark btn-drop" type="button" data-bs-toggle="dropdown">
          <mat-icon>menu</mat-icon>
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" routerLink="/dashboard">Dashboard</a></li>
          <li><a class="dropdown-item" routerLink="/products/vendorPros">Products</a></li>
          <li><a class="dropdown-item" routerLink="vendor-orders">Orders</a></li>
          <li><a class="dropdown-item" routerLink="vendor-profile">Settings</a></li>
        </ul>
      </div>
      <nav class="navbar navbar-light navbar-custom">
        <div class="container-fluid d-flex justify-content-between align-items-center">
          <span class="navbar-text me-3" *ngIf="vendorName">Hi, {{vendorName}}</span>
        </div>
      </nav>
      <button class="btn btn-outline-dark btn-logout" (click)="logout()">Logout</button>
    </div>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  vendorName: string = '';

  constructor(
    private vendorService: VendorProfileService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.shouldShowHeader()) {
      this.fetchVendorData();
    }
  }

  shouldShowHeader(): boolean {
    const currentRoute = this.router.url;
    const publicRoutes = ['/login', '/register'];
    return !publicRoutes.includes(currentRoute) && this.authService.isAuthenticated();
  }

  fetchVendorData() {
    this.vendorService.getVendorProfile().subscribe({
      next: (data) => {
        this.vendorName = data.user.name;
      },
      error: (error) => {
        console.error('Error fetching vendor data:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);  // Use Router instead of window.location
  }
}
