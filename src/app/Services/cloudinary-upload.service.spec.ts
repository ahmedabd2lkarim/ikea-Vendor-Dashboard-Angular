/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CloudinaryUploadService } from './cloudinary-upload.service';

describe('Service: CloudinaryUpload', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CloudinaryUploadService]
    });
  });

  it('should ...', inject([CloudinaryUploadService], (service: CloudinaryUploadService) => {
    expect(service).toBeTruthy();
  }));
});
