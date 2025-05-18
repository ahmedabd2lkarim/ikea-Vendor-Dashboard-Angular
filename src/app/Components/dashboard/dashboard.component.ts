import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ProductsWithApiService } from '../../Services/products-with-api.service';
import { CartService } from '../../Services/cart.service';
import { DashboardAnalytics } from '../../Models/dashboard-analytics';
import { OrderStatus } from '../../Models/order-status';
import { IProduct } from '../../Models/iproduct';
import { ICart } from '../../Models/icart';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl:"./dashboard.component.html" ,styleUrls: ['./dashboard.component.scss'] 
})
export class DashboardComponent implements OnInit {
  @ViewChild('orderStatusChart') orderStatusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inventoryChart') inventoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  totalRevenue: number = 0;
  private charts: Chart[] = [];

  constructor(
    private productsService: ProductsWithApiService,
    private cartService: CartService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.cartService.getVendorOrders().subscribe(orders => {
      console.log('Orders:', orders); // Log orders data
      this.calculateRevenue(orders);
      this.initOrderStatusChart(orders);
    });

    this.productsService.getAllProducts().subscribe(products => {
      console.log('Products:', products); // Log products data
      this.initInventoryChart(products);
      this.initCategoryChart(products);
    });
  }

  private calculateRevenue(orders: ICart[]) {
    this.totalRevenue = orders.reduce((total, order) => {
      return total + (order.status !== OrderStatus.cancelled ? order.subTotal : 0);
    }, 0);
  }

  private initOrderStatusChart(orders: ICart[]) {
    const statusCounts = orders.length ? orders.reduce((acc, order) => {
  acc[order.status] = (acc[order.status] || 0) + 1;
  return acc;
}, {} as Record<OrderStatus, number>) : { 'No Data': 0 };


    const ctx = this.orderStatusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#ffc107', // pending
            '#007bff', // processing
            '#28a745', // shipped
            '#17a2b8', // delivered
            '#dc3545'  // cancelled
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }));
  }

  private initInventoryChart(products: IProduct[]) {
    console.log('Initializing Inventory Chart with products:', products); // Log products data
    const ctx = this.inventoryChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get context for inventory chart');
      return;
    }

    const lowStock = products.length ? products.filter(p => p.stockQuantity < 50) : [{ name: 'No data', stockQuantity: 0 }];

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: lowStock.map(p => p.name),
        datasets: [{
          label: 'Stock Quantity',
          data: lowStock.map(p => p.stockQuantity),
          backgroundColor: lowStock.map(p => 
            p.stockQuantity < 30 ? '#dc3545' : '#ffc107'
          )
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Stock Level'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }));
  }

  private initCategoryChart(products: IProduct[]) {
    console.log('Initializing Category Chart with products:', products); // Log products data
    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get context for category chart');
      return;
    }

    const categoryCount = products.length ? products.reduce((acc, product) => {
  acc[product.categoryName] = (acc[product.categoryName] || 0) + 1;
  return acc;
}, {} as Record<string, number>) : { 'No Data': 0 };

    this.charts.push(new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryCount),
        datasets: [{
          data: Object.values(categoryCount),
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#17a2b8',
            '#dc3545',
            '#6610f2'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }));
  }

  ngOnDestroy() {
    // Cleanup charts
    this.charts.forEach(chart => chart.destroy());
  }
}
