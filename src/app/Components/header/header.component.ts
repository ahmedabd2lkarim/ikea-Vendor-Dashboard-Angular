import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
    <header class="main-header" *ngIf="shouldShowHeader()">
      <div class="header-container">
        <div class="header-left">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
          <!-- <div class="logo-section">
            <img
              src="assets/images/ikea-logo.svg"
              alt="IKEA Vendor"
              class="logo"
            />
          </div> -->

          <!-- <nav class="main-nav">
            <a routerLink="/dashboard" routerLinkActive="active">
              <i class="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </a>
            <a routerLink="/products/vendorPros" routerLinkActive="active">
              <i class="fas fa-box-open"></i>
              <span>Products</span>
            </a>
            <a routerLink="vendor-orders" routerLinkActive="active">
              <i class="fas fa-shopping-cart"></i>
              <span>Orders</span>
            </a>
          </nav> -->
        </div>

        <div class="header-right">
          <div class="vendor-info" *ngIf="vendorName">
            <div class="vendor-avatar">
              {{ vendorName.charAt(0).toUpperCase() }}
            </div>
            <div class="vendor-details">
              <span class="greeting">Welcome back,</span>
              <span class="name">{{ vendorName }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="action-btn" routerLink="vendor-profile">
              <i class="fas fa-cog"></i>
            </button>
            <button class="action-btn logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  vendorName: string = '';
  @Output() menuToggle = new EventEmitter<void>();

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
  toggleSidebar() {
    this.menuToggle.emit();
  }

  shouldShowHeader(): boolean {
    const currentRoute = this.router.url;
    const publicRoutes = ['/login', '/register'];
    return (
      !publicRoutes.includes(currentRoute) && this.authService.isAuthenticated()
    );
  }

  fetchVendorData() {
    this.vendorService.getVendorProfile().subscribe({
      next: (data) => {
        this.vendorName = data.user.name;
      },
      error: (error) => {
        console.error('Error fetching vendor data:', error);
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Use Router instead of window.location
  }
}
