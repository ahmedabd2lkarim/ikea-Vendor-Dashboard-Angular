import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
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

  getAllProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.baseURL}/products/vendor`);
  }

  getProductById(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.baseURL}/products/vendor/${id}`);
  }

  createProduct(product: Partial<IProduct>): Observable<IProduct> {
    const productData = {
      ...product,
      variants: product.variants?.map((variant) => {
        const { _id, ...variantData } = variant;
        return variantData;
      }),
    };
    return this.http.post<IProduct>(
      `${this.baseURL}/products/vendor`,
      productData
    );
  }

  updateProduct(id: string, product: Partial<IProduct>): Observable<IProduct> {
    // Clean up variant data before sending
    const productData = {
      ...product,
      variants: product.variants?.map((variant) => {
        if (variant._id) {
          return variant;
        }
        const { _id, ...newVariantData } = variant;
        return newVariantData;
      }),
    };

    return this.http
      .patch<IProduct>(
        `${this.baseURL}/products/vendor/${id}`,
        productData
      )
      .pipe(
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        })
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
