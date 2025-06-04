import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, RouterModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit, OnDestroy {
  opened = true;
  isCollapsed = false;
  isMobile = false;
  private resizeObserver: ResizeObserver;

  constructor(private router: Router, public authService: AuthService) {
    this.resizeObserver = new ResizeObserver(() => {
      this.checkScreenSize();
    });
  }
  shouldShowSidebar(): boolean {
    const currentRoute = this.router.url;
    const publicRoutes = ['/login', '/register'];
    return (
      !publicRoutes.includes(currentRoute) && this.authService.isAuthenticated()
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isMobile && this.opened) {
      this.toggleSidebar();
    }
  }

  checkScreenSize() {
    requestAnimationFrame(() => {
      this.isMobile = window.innerWidth < 768;
      if (this.isMobile) {
        this.opened = false;
        this.isCollapsed = false;
      } else {
        this.opened = true;
      }
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.opened = !this.opened;
    }
  }
}
