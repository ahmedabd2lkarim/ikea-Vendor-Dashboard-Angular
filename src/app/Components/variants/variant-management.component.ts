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

@Component({
  selector: 'app-variant-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './variant-management.component.html',
  styleUrls: ['./variant-management.component.scss'],
})
export class VariantManagementComponent implements OnInit {
  @Input() productId!: string;
  @Input() mainProduct!: IProduct;
  @Input() variants: IVariant[] = [];
  @Output() variantsChange = new EventEmitter<IVariant[]>();

  variantForm: FormGroup;
  showForm = false;
  editingVariantId: string | null = null;
  isLoading = false;
  showMeasurementSection = false;
  measurementUnits = ['mm', 'cm', 'm', 'inch', 'ft'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private snackBar: MatSnackBar
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
    // Reset images array
    const imagesFormArray = this.imagesArray;
    imagesFormArray.clear();
    variant.images.forEach((img) => {
      imagesFormArray.push(this.fb.control(img));
    });

    this.variantForm.patchValue({
      color: variant.color,
      price: {
        currentPrice: variant.price.currentPrice,
        discounted: variant.price.discounted,
      },
      measurement: variant.measurement,
    });

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
    // Update validator when section is toggled
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
    const variantData: IVariant = {
      color: formValue.color,
      price: formValue.price,
      measurement: formValue.measurement,
      images: formValue.images.filter((img: string) => img),
    };

    if (!this.productId) {
      if (this.editingVariantId) {
        variantData._id = this.editingVariantId;
      } else {
        // Push new variant to local array
        this.variants.push({ ...variantData, _id: this.generateLocalId() });
      }

      this.variantsChange.emit(this.variants);
      this.snackBar.open(
        `Variant ${this.editingVariantId ? 'updated' : 'added'} locally`,
        'Close',
        { duration: 3000 }
      );
      this.isLoading = false;
      this.cancelEdit();
      return;
    }

    // 📡 Existing product mode: use API
    if (this.editingVariantId) {
      this.productsService
        .updateVariant(this.productId, this.editingVariantId, variantData)
        .subscribe({
          next: (updatedVariant) => {
            this.snackBar.open('Variant updated successfully', 'Close', {
              duration: 3000,
            });
            this.isLoading = false;
            this.cancelEdit();
            this.variantsChange.emit(
              this.variants.map((v) =>
                v._id === updatedVariant._id ? updatedVariant : v
              )
            );
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.snackBar.open(
              'Error updating variant: ' +
                (error.error.message || 'Unknown error'),
              'Close',
              { duration: 5000 }
            );
          },
        });
    } else {
      console.log(variantData);
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

    console.log(variantData);
  }

  deleteVariant(variantId: string) {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    // Find and remove the variant from the array
    this.variants = this.variants.filter(
      (variant) => variant._id !== variantId
    );

    // Emit the updated variants array
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

    // Show success message
    // this.showSuccess('Variant deleted successfully');
  }

  private showSuccess(message: string) {
    // If you're using MatSnackBar
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
}
