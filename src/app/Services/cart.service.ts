import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICart } from '../Models/icart';
import { OrderStatus } from '../Models/order-status';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseURL = `${environment.baseURL}/api/orders`;

  constructor(private http: HttpClient) {}

  getVendorOrders(): Observable<ICart[]> {
    return this.http.get<ICart[]>(`${this.baseURL}/vendor`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<ICart> {
    return this.http.patch<ICart>(`${this.baseURL}/status/${orderId}`, {
      status,
    });
  }

  updateOrderAmount(orderId: string, amount: number): Observable<ICart> {
    return this.http.patch<ICart>(`${this.baseURL}/amount/${orderId}`, {
      amount,
    });
  }
}
