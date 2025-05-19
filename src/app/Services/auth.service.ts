import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VendorAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface VendorRegister {
  name: string;
  email: string;
  password: string;
  storeName: string;
  storeAddress: string;
  mobileNumber: string;
  role: string; // Add this field
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.baseURL}/api/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('token')
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<VendorAuth> {
    return this.http
      .post<VendorAuth>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
      
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(vendorData: VendorRegister): Observable<VendorAuth> {
    return this.http
      .post<VendorAuth>(`${this.baseUrl}/register`, vendorData)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
