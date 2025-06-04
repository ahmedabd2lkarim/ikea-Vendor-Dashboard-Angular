import { Routes } from '@angular/router';
import { CartComponent } from './Components/cart/cart.component';
import { OrderDetailsComponent } from './Components/order-details/order-details.component';
import { VendorProfileComponent } from './Components/vendor-profile/vendor-profile.component';
import { ProductsComponent } from './Components/products/products/products.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { RegisterComponent } from './Components/auth/register/register.component';
import { authGuard } from './guards/auth.guard';
import { ProductFormComponent } from './Components/products/product-form/product-form.component';
import { ProductComponent } from './Components/product-details/product.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register',
  },
  {
    path: 'orderDet/:ordID',
    component: OrderDetailsComponent,
    title: 'Order Details',
    canActivate: [authGuard],
  },
  {
    path: 'vendor-orders',
    component: CartComponent,
    title: 'Vendor Orders',
    canActivate: [authGuard],
  },
  {
    path: 'vendor-profile',
    component: VendorProfileComponent,
    title: 'Vendor Profile',
    canActivate: [authGuard],
  },
  {
    path: 'products/vendorPros',
    component: ProductsComponent,
    title: "Vendor's Products",
    canActivate: [authGuard],
  },
  {
    path: 'products/vendorPros/:prdID',
    component: ProductComponent,
    title: 'View Product',
    canActivate: [authGuard],
  },
  {
    path: 'products/edit/:id',
    component: ProductFormComponent,
  },
  {
    path: 'products/new',
    component: ProductFormComponent,
    title: 'Add New Product',
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Vendor Dashboard',
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
