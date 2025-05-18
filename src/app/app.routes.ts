import { Routes } from '@angular/router';
import { CartComponent } from './Components/cart/cart.component';
import { OrderDetailsComponent } from './Components/order-details/order-details.component';
import { VendorProfileComponent } from './Components/vendor-profile/vendor-profile.component';
import { ProductsComponent } from './Components/products/products/products.component';
import { ProductComponent } from './Components/product-details/product.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { RegisterComponent } from './Components/auth/register/register.component';
import { authGuard } from './guards/auth.guard';
import { ProductFormComponent } from './Components/products/product-form/product-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
    path: 'products/edit/:prdID',
    component: ProductFormComponent,
    title: 'Edit Product',
    canActivate: [authGuard],
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
