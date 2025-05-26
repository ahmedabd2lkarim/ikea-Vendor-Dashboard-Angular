import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../Services/cart.service';
import { ICart } from '../../Models/icart';
import { OrderStatus } from '../../Models/order-status';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="orders-container">
      <h2>Order Management</h2>
      
      <!-- Status Filter -->
      <div class="filters">
        <mat-form-field>
          <mat-label>Filter by Status</mat-label>
          <select matNativeControl [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()">
            <option value="">All</option>
            <option *ngFor="let status of orderStatuses" [value]="status">
              {{status}}
            </option>
          </select>
        </mat-form-field>
      </div>

      <!-- Loading Spinner -->
      <div class="loading-spinner" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">
        {{error}}
      </div>

      <!-- Orders Table -->
      <div class="table-container" *ngIf="!isLoading && !error">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- Order ID Column -->
          <ng-container matColumnDef="orderId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Order ID</th>
            <td mat-cell *matCellDef="let order">#{{order._id.substring(20)}}</td>
          </ng-container>

          <!-- Customer Column -->
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
            <td mat-cell *matCellDef="let order">{{order.userID.name}}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let order">
              <select 
                [(ngModel)]="order.status"
                (change)="updateStatus(order._id, order.status)"
                [class]="'status-' + order.status"
              >
                <option *ngFor="let status of orderStatuses" [value]="status">
                  {{status}}
                </option>
              </select>
            </td>
          </ng-container>

          <!-- Amount Column -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let order">
              <div class="amount-field">
                <span>{{order.currency}}</span>
                <input 
                  type="number" 
                  [value]="order.subTotal"
                  (blur)="updateAmount(order._id, $event)"
                  min="0"
                >
              </div>
            </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let order">
              {{order.createdAt | date:'medium'}}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let order">
              <button mat-button (click)="viewOrderDetails(order._id)">
                View Details
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator 
          [pageSizeOptions]="[5, 10, 25, 100]"
          [pageSize]="10"
          showFirstLastButtons
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 2rem;
    }

    .filters {
      margin-bottom: 1rem;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .error-message {
      color: #dc3545;
      padding: 1rem;
      background: #ffe6e6;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .status-pending { color: orange; }
    .status-processing { color: blue; }
    .status-shipped { color: green; }
    .status-delivered { color: #28a745; }
    .status-cancelled { color: #dc3545; }

    .amount-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input {
        width: 100px;
        padding: 0.25rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }

    select {
      padding: 0.25rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class CartComponent implements OnInit {
  dataSource: MatTableDataSource<ICart>;
  displayedColumns = ['orderId', 'customer', 'status', 'amount', 'date', 'actions'];
  orderStatuses = Object.values(OrderStatus);
  selectedStatus = '';
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<ICart>([]);
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadOrders() {
    this.isLoading = true;
    this.error = null;

    this.cartService.getVendorOrders().subscribe({
      next: (orders) => {
        console.log(orders);
        this.dataSource.data = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders. Please try again.';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  updateStatus(orderId: string, status: OrderStatus) {
    this.cartService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.snackBar.open('Order status updated successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Failed to update order status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  updateAmount(orderId: string, event: Event) {
    const amount = +(event.target as HTMLInputElement).value;
    if (amount < 0) return;

    this.cartService.updateOrderAmount(orderId, amount).subscribe({
      next: () => {
        this.snackBar.open('Order amount updated successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error updating order amount:', error);
        this.snackBar.open('Failed to update order amount', 'Close', {
          duration: 3000
        });
      }
    });
  }

  applyFilter() {
    if (this.selectedStatus) {
      this.dataSource.filter = this.selectedStatus;
    } else {
      this.dataSource.filter = '';
    }
  }

  viewOrderDetails(orderId: string) {
    // Navigate to order details page
    this.router.navigate(['/orderDet', orderId]);
  }
}
