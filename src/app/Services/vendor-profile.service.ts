import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendorProfileService {
  baseURL: string = `${environment.baseURL}/api/auth`;
  constructor(private httpClient: HttpClient) {}
  getVendorProfile(): Observable<any> {
    return this.httpClient.get(`${this.baseURL}/profile`);
  }

  updateVendorProfile(vendorData: any): Observable<any> {
    return this.httpClient.patch(
      `${this.baseURL}/updateVendor`,
      vendorData,
      this.getHeaders()
    );
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }
}
