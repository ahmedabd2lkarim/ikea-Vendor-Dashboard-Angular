import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SideBarComponent } from "./Components/side-bar/side-bar.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "./Components/header/header.component";
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSlideToggleModule, SideBarComponent, MatSidenavModule, MatIconModule, HeaderComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ProductStore';
  showHeader: boolean = true; 
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.showHeader = !this.router.url.includes('/login') && !this.router.url.includes('/register');
    });
  }

}