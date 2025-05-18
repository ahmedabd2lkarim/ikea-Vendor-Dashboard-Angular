import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProduct } from '../Models/iproduct';
import { Icategory } from '../Models/icategory';
import { IVariant } from '../Models/ivariant';

@Injectable({
  providedIn: 'root',
})
export class ProductsWithApiService {
  private baseURL = `${environment.baseURL}/api`;

  constructor(private http: HttpClient) {}

  // Product Management
  getAllProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.baseURL}/products/vendor`);
  }

  getProductById(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.baseURL}/products/vendor/${id}`);
  }

  createProduct(product: Partial<IProduct>): Observable<IProduct> {
    return this.http.post<IProduct>(`${this.baseURL}/products/vendor`, product);
  }

  updateProduct(id: string, product: Partial<IProduct>): Observable<IProduct> {
    return this.http.patch<IProduct>(
      `${this.baseURL}/products/vendor/${id}`,
      product
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}/products/vendor/${id}`);
  }

  getProductsByCategory(categoryId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(
      `${this.baseURL}/products/vendor/category/${categoryId}`
    );
  }

  getAllCategories(): Observable<Icategory[]> {
    return this.http.get<Icategory[]>(`${this.baseURL}/categories`);
  }

  // Variant Management
  getProductVariants(productId: string): Observable<IVariant[]> {
    return this.http.get<IVariant[]>(
      `${this.baseURL}/products/vendor/${productId}/variants`
    );
  }

  addVariant(
    productId: string,
    variant: Partial<IVariant>
  ): Observable<IVariant> {
    return this.http.post<IVariant>(
      `${this.baseURL}/products/vendor/${productId}/variants`,
      variant
    );
  }

  updateVariant(
    productId: string,
    variantId: string,
    variant: Partial<IVariant>
  ): Observable<IVariant> {
    return this.http.patch<IVariant>(
      `${this.baseURL}/products/vendor/${productId}/variants/${variantId}`,
      variant
    );
  }

  deleteVariant(productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseURL}/products/vendor/${productId}/variants/${variantId}`
    );
  }
}
