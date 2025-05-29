import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryUploadService {
  private cloudName = 'daao4rtqi';
  private uploadPreset = 'ikea_imgs';
  private apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const headers = new HttpHeaders();

    try {
      console.log('Uploading to:', this.apiUrl);
      console.log('Upload preset:', this.uploadPreset);
      console.log('File size:', file.size);

      const response = await lastValueFrom(
        this.http.post<any>(this.apiUrl, formData, {
          headers,
          observe: 'response',
        })
      );

      console.log('Full response:', response);

      if (!response.body || !response.body.secure_url) {
        throw new Error('Invalid response from Cloudinary');
      }

      return response.body.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  async uploadImageWithFetch(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      console.log('Using fetch API...');

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Fetch response:', result);

      if (!result.secure_url) {
        throw new Error('Invalid response from Cloudinary');
      }

      return result.secure_url;
    } catch (error) {
      console.error('Fetch upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
