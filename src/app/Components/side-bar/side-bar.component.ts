import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [MatSidenavModule, MatIconModule, RouterModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit, OnDestroy {
  opened = true;
  isCollapsed = false;
  isMobile = false;
  private resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => {
      this.checkScreenSize();
    });
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
