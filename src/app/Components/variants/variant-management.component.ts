import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ProductsWithApiService } from '../../Services/products-with-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IVariant } from '../../Models/ivariant';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../../Models/iproduct';
import { DragDropBoxComponent } from '../dragDrop-box/dragDrop-box.component';
import { CloudinaryUploadService } from '../../Services/cloudinary-upload.service';

@Component({
  selector: 'app-variant-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropBoxComponent],
  templateUrl: './variant-management.component.html',
  styleUrls: ['./variant-management.component.scss'],
})
export class VariantManagementComponent implements OnInit {
  @Input() productId!: string;
  @Input() mainProduct!: IProduct;
  @Input() variants: IVariant[] = [];
  @Output() variantsChange = new EventEmitter<IVariant[]>();
  tempNewVariantImages: string[] = [];

  variantForm: FormGroup;
  showForm = false;
  editingVariantId: string | null = null;
  showMeasurementSection = false;
  measurementUnits = ['mm', 'cm', 'm', 'inch', 'ft'];
  variantImages: { [key: string]: string[] } = {};
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private snackBar: MatSnackBar,
    private cloudinaryService: CloudinaryUploadService // Add this
  ) {
    // Initialize form in constructor
    this.variantForm = this.createVariantForm();
  }

  ngOnInit(): void {
    // Re-initialize form when main product changes
    if (!this.mainProduct) {
      console.warn('mainProduct not provided!');
      return;
    }
    this.variantForm = this.createVariantForm();
  }

  private generateLocalId(): string {
    return 'local-' + Math.random().toString(36).substr(2, 9);
  }

  private createVariantForm(): FormGroup {
    return this.fb.group({
      color: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      price: this.fb.group({
        currency: [
          {
            value: this.mainProduct?.price?.currency || 'EGP',
          },
        ],
        currentPrice: [0, [Validators.required, Validators.min(0)]],
        discounted: [false],
      }),
      measurement: this.fb.group(
        {
          unit: [
            this.mainProduct?.measurement?.unit || 'cm',
            Validators.required,
          ],
          width: 0,
          height: 0,
          depth: 0,
          length: 0,
        },
        { validators: this.measurementValidator }
      ),
      images: this.fb.array([]),
    });
  }

  get imagesArray(): FormArray {
    return this.variantForm.get('images') as FormArray;
  }

  showAddForm() {
    this.showForm = true;
    this.editingVariantId = null;
    this.tempNewVariantImages = [];
    // Safely reset form
    if (this.variantForm) {
      this.variantForm.reset({
        price: {
          currency: this.mainProduct?.price?.currency || 'EGP',
          discounted: false,
        },
        measurement: {
          unit: this.mainProduct?.measurement?.unit || 'cm',
        },
      });

      // Safely clear arrays
      const imagesArray = this.imagesArray;
      if (imagesArray) {
        while (imagesArray.length) {
          imagesArray.removeAt(0);
        }
      }
    }
  }

  addImage() {
    this.imagesArray.push(this.fb.control(''));
  }

  removeImage(index: number) {
    this.imagesArray.removeAt(index);
  }

  editVariant(variant: IVariant) {
    this.showForm = true;
    this.editingVariantId = variant._id ?? null;

    // Initialize images for this variant
    if (variant._id) {
      this.variantImages[variant._id] = [...(variant.images || [])];
    }

    // Update form values
    this.variantForm.patchValue({
      color: variant.color,
      price: {
        currency: variant.price.currency,
        currentPrice: variant.price.currentPrice,
        discounted: variant.price.discounted,
      },
      measurement: variant.measurement || {
        unit: this.mainProduct?.measurement?.unit || 'cm',
        width: 0,
        height: 0,
        depth: 0,
        length: 0,
      },
      images: variant.images || [],
    });

    // Set measurement section visibility
    this.showMeasurementSection = !!(
      variant.measurement &&
      (variant.measurement.width ||
        variant.measurement.height ||
        variant.measurement.depth ||
        variant.measurement.length)
    );
  }

  cancelEdit() {
    this.showForm = false;
    this.editingVariantId = null;
    this.variantForm
      .get('measurement.unit')
      ?.setValue(this.mainProduct?.measurement?.unit || 'cm');
    this.variantForm.reset({
      color: { en: '', ar: '' },
      price: {
        currency: this.mainProduct?.price?.currency || 'EGP',
        currentPrice: 0,
        discounted: false,
      },
      measurement: {
        unit: this.mainProduct?.measurement?.unit || 'cm',
        width: 0,
        height: 0,
        depth: 0,
        length: 0,
      },
      images: [],
    });
  }

  measurementValidator = (group: AbstractControl) => {
    if (!this.showMeasurementSection) return null;

    const width = group.get('width')?.value;
    const height = group.get('height')?.value;
    const depth = group.get('depth')?.value;
    const length = group.get('length')?.value;

    if (!width && !height && !depth && !length) {
      return { requireAtLeastOne: true };
    }
    return null;
  };

  toggleMeasurementSection(): void {
    this.showMeasurementSection = !this.showMeasurementSection;
    if (!this.showMeasurementSection) {
      this.variantForm.get('measurement')?.reset({
        width: 0,
        height: 0,
        depth: 0,
        length: 0,
        unit: 'cm',
      });
    }
    this.variantForm.get('measurement')?.updateValueAndValidity();
  }

  isMeasurementSectionInvalid(): boolean {
    const measurementControl = this.variantForm.get('measurement');
    return !!(
      measurementControl?.errors?.['requireAtLeastOne'] &&
      measurementControl?.touched
    );
  }

  onSubmit() {
    if (this.variantForm.invalid) {
      this.variantForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.variantForm.value;

    // Create variant data with images from variantImages object
    const variantData: Partial<IVariant> = {
      color: {
        en: formValue.color.en.trim(),
        ar: formValue.color.ar.trim(),
      },
      price: {
        currency: formValue.price.currency || 'EGP',
        currentPrice: Number(formValue.price.currentPrice),
        discounted: Boolean(formValue.price.discounted),
      },
    };

    // Add measurement only if section is shown and has values
    if (this.showMeasurementSection) {
      variantData.measurement = {
        unit: formValue.measurement.unit,
        width: Number(formValue.measurement.width) || 0,
        height: Number(formValue.measurement.height) || 0,
        depth: Number(formValue.measurement.depth) || 0,
        length: Number(formValue.measurement.length) || 0,
      };
    }

    if (this.editingVariantId && this.variantImages[this.editingVariantId]) {
      variantData.images = this.variantImages[this.editingVariantId];
    } else {
      console.log('creation product');
      variantData.images = this.tempNewVariantImages;
    }

    if (!this.productId) {
      if (this.editingVariantId) {
        const index = this.variants.findIndex(
          (v) => v._id === this.editingVariantId
        );
        if (index !== -1) {
          this.variants[index] = {
            ...this.variants[index],
            ...variantData,
          } as IVariant;
          this.snackBar.open('Variant updated locally', 'Close', {
            duration: 3000,
          });
        }
      } else {
        const newVariant: IVariant = {
          _id: this.generateLocalId(),
          color: {
            en: formValue.color.en.trim(),
            ar: formValue.color.ar.trim(),
          },
          price: {
            currency: formValue.price.currency || 'EGP',
            currentPrice: Number(formValue.price.currentPrice),
            discounted: Boolean(formValue.price.discounted),
          },
          measurement: this.showMeasurementSection
            ? {
                unit: formValue.measurement.unit,
                width: Number(formValue.measurement.width) || 0,
                height: Number(formValue.measurement.height) || 0,
                depth: Number(formValue.measurement.depth) || 0,
                length: Number(formValue.measurement.length) || 0,
              }
            : undefined,
          images: this.tempNewVariantImages,
          contextualImageUrl: undefined,
        };

        this.variants.push(newVariant);
        this.snackBar.open('Variant added locally', 'Close', {
          duration: 3000,
        });
      }

      this.variantsChange.emit(this.variants);
      this.isLoading = false;
      this.cancelEdit();
      return;
    }

    if (this.editingVariantId) {
      console.log('Updating variant with data:', variantData); // Debug log

      this.productsService
        .updateVariant(this.productId, this.editingVariantId, variantData)
        .subscribe({
          next: (updatedVariant) => {
            this.variants = this.variants.map((v) =>
              v._id === this.editingVariantId ? updatedVariant : v
            );

            this.variantsChange.emit(this.variants);
            this.snackBar.open('Variant updated successfully', 'Close', {
              duration: 3000,
            });
            this.isLoading = false;
            this.cancelEdit();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error updating variant:', error);
            this.isLoading = false;
            this.snackBar.open(
              `Error updating variant: ${
                error.error?.message || 'Unknown error'
              }`,
              'Close',
              { duration: 5000 }
            );
          },
        });
    } else {
      this.productsService.addVariant(this.productId, variantData).subscribe({
        next: (newVariant) => {
          this.snackBar.open('Variant added successfully', 'Close', {
            duration: 3000,
          });
          this.isLoading = false;
          this.cancelEdit();
          this.variantsChange.emit([...this.variants, newVariant]);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.snackBar.open(
            'Error adding variant: ' + (error.error.message || 'Unknown error'),
            'Close',
            { duration: 5000 }
          );
        },
      });
    }
  }

  deleteVariant(variantId: string) {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    this.variants = this.variants.filter(
      (variant) => variant._id !== variantId
    );

    this.variantsChange.emit(this.variants);

    if (this.productId && !variantId.startsWith('local-')) {
      this.productsService.deleteVariant(this.productId, variantId).subscribe({
        next: () => {
          this.showSuccess('Variant deleted successfully');
        },
        error: (err) => {
          this.snackBar.open('Failed to delete variant from server', 'Close', {
            duration: 4000,
          });
        },
      });
    }

   
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

 

  onVariantImageRemoved(variantId: string, url: string) {
    this.variantImages[variantId] = this.variantImages[variantId].filter(
      (img) => img !== url
    );

    if (this.editingVariantId === variantId) {
      this.variantForm.patchValue({
        images: this.variantImages[variantId],
      });
    }

    this.updateVariantImages(variantId, this.variantImages[variantId]);
  }

  private updateVariantImages(variantId: string, urls: string[]) {
    const variant = this.variants.find((v) => v._id === variantId);
    if (variant) {
      variant.images = urls;
      this.variantsChange.emit([...this.variants]);
    }
  }

  async onVariantImagesUploaded(
    variantId: string | null,
    input: File[] | string[]
  ) {
    try {
      this.isLoading = true;
      let urls: string[] = [];

      if (input instanceof Array && input[0] instanceof File) {
        urls = await this.cloudinaryService.uploadImages(input as File[]);
      } else {
        urls = input as string[];
      }

      if (variantId) {
        this.variantImages[variantId] = [
          ...(this.variantImages[variantId] || []),
          ...urls,
        ];

        if (this.editingVariantId === variantId) {
          this.variantForm.patchValue({
            images: this.variantImages[variantId],
          });
        }
        this.updateVariantImages(variantId, this.variantImages[variantId]);
      } else {
        this.tempNewVariantImages = [
          ...(this.tempNewVariantImages || []),
          ...urls,
        ];
        this.variantForm.patchValue({
          images: this.tempNewVariantImages,
        });
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error uploading images:', error);
      this.isLoading = false;
      this.snackBar.open('Failed to upload images', 'Close', {
        duration: 3000,
      });
    }
  }

  handleEditClick(event: Event, variant: IVariant): void {
    event.preventDefault();
    event.stopPropagation();

    this.editVariant(variant);
  }
}
