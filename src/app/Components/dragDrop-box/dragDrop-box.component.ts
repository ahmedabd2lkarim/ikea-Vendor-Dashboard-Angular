import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CloudinaryUploadService } from '../../Services/cloudinary-upload.service';
import { DataUrlPipe } from '../../Pipes/DataUrl.pipe';

@Component({
  selector: 'app-dragDrop-box',
  templateUrl: './dragDrop-box.component.html',
  styleUrls: ['./dragDrop-box.component.css'],
  imports: [CommonModule, NgxDropzoneModule, DataUrlPipe],
  standalone: true,
})
export class DragDropBoxComponent {
  @Input() existingImages: string[] = [];
  @Input() maxFiles = 10;
  @Input() acceptMultiple = true;
  @Input() label = 'Drop images here or click to upload';
  @Input() autoUpload = true;
  @Input() maxFileSize = 5242880; // 5MB in bytes
  @Output() imagesUploaded = new EventEmitter<string[]>();
  @Output() imageRemoved = new EventEmitter<string>();
  @Output() uploadProgress = new EventEmitter<{
    current: number;
    total: number;
  }>();

  files: File[] = [];
  isUploading = false;
  uploadProgress$ = { current: 0, total: 0 };

  constructor(private upload: CloudinaryUploadService) {}

  async onSelect(event: any): Promise<void> {
    const addedFiles = event.addedFiles;

    // Validate file size
    const validFiles = addedFiles.filter((file:any) => {
      if (file.size > this.maxFileSize) {
        this.showError(
          `File ${file.name} is too large. Maximum size is ${
            this.maxFileSize / 1048576
          }MB`
        );
        return false;
      }
      return true;
    });

    if (!this.acceptMultiple) {
      // Single file mode - replace existing file
      this.files = [validFiles[0]];
    } else {
      // Multiple files mode - check limits
      const totalFiles =
        this.files.length + validFiles.length + (this.existingImages?.length || 0);

      if (totalFiles > this.maxFiles) {
        this.showError(`Maximum ${this.maxFiles} files allowed`);
        const remainingSlots =
          this.maxFiles - this.files.length - (this.existingImages?.length || 0);
        validFiles.splice(remainingSlots);
      }

      this.files.push(...validFiles);
    }

    // Auto-upload if enabled
    if (this.autoUpload && this.files.length > 0) {
      await this.uploadFiles();
    }
  }

  private showError(message: string): void {
    // Implement your preferred error notification method
    console.error(message);
    // You could emit an error event or use a notification service
  }

  // Add drag and drop animation states
  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onRemove(file: File): void {
    this.files = this.files.filter((f) => f !== file);
  }

  removeExistingImage(url: string): void {
    if (!this.acceptMultiple) {
      // For single image mode, just emit the removal
      this.imageRemoved.emit(url);
    } else {
      // For multiple images, remove from existing images and emit
      this.existingImages = this.existingImages.filter((img) => img !== url);
      this.imageRemoved.emit(url);
    }
  }

  async uploadFiles(): Promise<void> {
    if (!this.files.length) return;

    this.isUploading = true;
    this.uploadProgress$ = { current: 0, total: this.files.length };
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        this.uploadProgress$ = { current: i + 1, total: this.files.length };
        this.uploadProgress.emit(this.uploadProgress$);

        const url = await this.upload.uploadImage(file);
        uploadedUrls.push(url);
      }

      // Handle single image mode
      if (!this.acceptMultiple && uploadedUrls.length > 0) {
        // Remove old image if exists
        if (this.existingImages?.length > 0) {
          this.imageRemoved.emit(this.existingImages[0]);
        }
        this.existingImages = [uploadedUrls[0]];
      }

      this.files = [];
      this.imagesUploaded.emit(uploadedUrls);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.isUploading = false;
      this.uploadProgress$ = { current: 0, total: 0 };
    }
  }

  getTotalImages(): number {
    return (this.existingImages?.length || 0) + this.files.length;
  }

  canAddMore(): boolean {
    if (!this.acceptMultiple) {
      return this.getTotalImages() === 0;
    }
    return this.getTotalImages() < this.maxFiles;
  }
}
