import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
  template: `
  <div class="variants-container">
    <h3>Product Variants</h3>
    
    <!-- Variants List -->
    <div class="variants-list" *ngIf="variants.length">
      <div class="variant-item" *ngFor="let variant of variants">
        <div class="variant-header">
          <h4>{{mainProduct.name}} - {{variant.color.en}}</h4>
          <div class="variant-actions">
            <button class="edit-btn" (click)="editVariant(variant)">Edit</button>
            <button class="delete-btn" (click)="deleteVariant(variant._id!)">Delete</button>
          </div>
        </div>
        <div class="variant-details">
          <p>Color: {{variant.color.en}} / {{variant.color.ar}}</p>
          <p>Price: {{variant.price.currency}} {{variant.price.currentPrice}}</p>
          <p *ngIf="variant.measurement">
            Measurements: 
            <span *ngIf="variant.measurement.width">W: {{variant.measurement.width}}{{variant.measurement.unit}}</span>
            <span *ngIf="variant.measurement.height">H: {{variant.measurement.height}}{{variant.measurement.unit}}</span>
            <span *ngIf="variant.measurement.depth">D: {{variant.measurement.depth}}{{variant.measurement.unit}}</span>
          </p>
        </div>
      </div>
    </div>

    <form [formGroup]="variantForm" (ngSubmit)="onSubmit()" *ngIf="showForm && variantForm" class="variant-form">
      <!-- Color Group -->
      <div formGroupName="color" class="form-group">
        <label>Color <span class="required">*</span></label>
        <div class="bilingual-fields">
          <input type="text" formControlName="en" placeholder="English" 
                 [class.error]="variantForm.get('color.en')?.invalid && variantForm.get('color.en')?.touched">
          <input type="text" formControlName="ar" placeholder="Arabic" dir="rtl"
                 [class.error]="variantForm.get('color.ar')?.invalid && variantForm.get('color.ar')?.touched">
        </div>
        <div class="error-message" *ngIf="variantForm.get('color.en')?.invalid && variantForm.get('color.en')?.touched">
          Color in English is required
        </div>
        <div class="error-message" *ngIf="variantForm.get('color.ar')?.invalid && variantForm.get('color.ar')?.touched">
          Color in Arabic is required
        </div>
      </div>

      <!-- Price Group -->
      <div formGroupName="price" class="form-group">
        <label>Price <span class="required">*</span></label>
        <div class="price-fields">
          <input type="number" formControlName="currentPrice" placeholder="Price" min="0"
                 [class.error]="variantForm.get('price.currentPrice')?.invalid && variantForm.get('price.currentPrice')?.touched">
          <input type="text" formControlName="currency" [value]="mainProduct?.price?.currency" readonly>
          <div class="checkbox-field">
            <label>
              <input type="checkbox" formControlName="discounted">
              Discounted
            </label>
          </div>
        </div>
        <div class="error-message" *ngIf="variantForm.get('price.currentPrice')?.invalid && variantForm.get('price.currentPrice')?.touched">
          Please enter a valid price
        </div>
      </div>

      <!-- Images -->
      <div class="form-group">
        <label>Images</label>
        <div formArrayName="images" class="images-list" *ngIf="imagesArray">
          <div *ngFor="let image of imagesArray?.controls; let i=index" class="image-item">
            <input [formControlName]="i" placeholder="Image URL">
            <button type="button" class="remove-btn" (click)="removeImage(i)">×</button>
          </div>
        </div>
        <button type="button" class="add-image-btn" (click)="addImage()">
          + Add Image
        </button>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
        <button type="submit" [disabled]="variantForm.invalid || isLoading">
          {{ editingVariantId ? 'Update' : 'Add' }} Variant
        </button>
      </div>
    </form>

    <button class="add-variant-btn" *ngIf="!showForm" (click)="showAddForm()">
      Add New Variant
    </button>
  </div>
`,
  styles: [`
    .variants-container {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .variants-list {
      margin: 1rem 0;
    }

    .variant-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .variant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .variant-actions {
      display: flex;
      gap: 0.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .option-row, .price-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .edit-btn {
      background: #0051ba;
      color: white;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
    }

    .add-variant-btn {
      background: #0051ba;
      color: white;
      width: 100%;
      margin-top: 1rem;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
    }

    .checkbox-field label {
      margin-left: 0.5rem;
    }

    .bilingual-fields {
      display: flex;
      gap: 0.5rem;
    }

    .images-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .image-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .remove-btn {
      background: transparent;
      color: #dc3545;
      cursor: pointer;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
    }

    .add-image-btn {
      background: #0051ba;
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .required {
      color: #dc3545;
    }
  `]
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
    if (this.mainProduct) {
      this.variantForm = this.createVariantForm();
    }
  }

  private createVariantForm(): FormGroup {
    return this.fb.group({
      color: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      price: this.fb.group({
        currency: [{ 
          value: this.mainProduct?.price?.currency || 'EGP', 
          disabled: true 
        }],
        currentPrice: [0, [Validators.required, Validators.min(0)]],
        discounted: [false]
      }),
      measurement: this.fb.group({
        unit: [{ 
          value: this.mainProduct?.measurement?.unit || 'cm', 
          disabled: true 
        }],
        width: [null],
        height: [null],
        depth: [null],
        length: [null]
      }),
      images: this.fb.array([])
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
          discounted: false
        },
        measurement: { 
          unit: this.mainProduct?.measurement?.unit || 'cm'
        }
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
    
    this.variantForm.patchValue({
      color: variant.color,
      price: {
        currentPrice: variant.price.currentPrice,
        discounted: variant.price.discounted
      },
      measurement: variant.measurement,
      images: variant.images
    });
  }

  cancelEdit() {
    this.showForm = false;
    this.editingVariantId = null;
    this.variantForm.reset();
  }

  onSubmit() {
    if (this.variantForm.invalid) {
      this.variantForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.variantForm.value;
    const variantData: IVariant = {
      _id: this.editingVariantId || undefined,
      name: this.mainProduct.name,
      typeName: this.mainProduct.typeName,
      imageAlt: this.mainProduct.imageAlt,
      short_description: this.mainProduct.short_description,
      product_details: this.mainProduct.product_details,
      color: formValue.color,
      price: formValue.price,
      measurement: formValue.measurement,
      images: formValue.images.filter((img: string) => img)
    };

    if (this.editingVariantId) {
      // Update existing variant
      this.productsService.updateVariant(this.productId, this.editingVariantId, variantData)
        .subscribe({
          next: (updatedVariant) => {
            this.snackBar.open('Variant updated successfully', 'Close', { duration: 3000 });
            this.isLoading = false;
            this.cancelEdit();
            this.variantsChange.emit(this.variants.map(v => v._id === updatedVariant._id ? updatedVariant : v));
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.snackBar.open('Error updating variant: ' + (error.error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
    } else {
      // Add new variant
      this.productsService.addVariant(this.productId, variantData)
        .subscribe({
          next: (newVariant) => {
            this.snackBar.open('Variant added successfully', 'Close', { duration: 3000 });
            this.isLoading = false;
            this.cancelEdit();
            this.variantsChange.emit([...this.variants, newVariant]);
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.snackBar.open('Error adding variant: ' + (error.error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
    }
  }

  deleteVariant(variantId: string) {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    // Find and remove the variant from the array
    this.variants = this.variants.filter(variant => variant._id !== variantId);
    
    // Emit the updated variants array
    this.variantsChange.emit(this.variants);

    // Show success message
    this.showSuccess('Variant deleted successfully');
  }

  private showSuccess(message: string) {
    // If you're using MatSnackBar
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}