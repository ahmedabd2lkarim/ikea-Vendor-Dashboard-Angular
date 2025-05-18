import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductsWithApiService } from '../../Services/products-with-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IVariant } from '../../Models/ivariant';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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
            <h4>{{variant.name}}</h4>
            <div class="variant-actions">
              <button class="edit-btn" (click)="editVariant(variant)">Edit</button>
              <button class="delete-btn" (click)="deleteVariant(variant._id)">Delete</button>
            </div>
          </div>
          <div class="variant-details">
            <p>Options: {{variant.color.join(', ')}}</p>
            <!-- <p *ngIf="variant.price">Prices: {{variant.prices.join(', ')}}</p> -->
          </div>
        </div>
      </div>

      <form [formGroup]="variantForm" (ngSubmit)="onSubmit()" *ngIf="showForm">
        <div formGroupName="color" class="form-group">
          <label for="colorEn">Color (English)</label>
          <input type="text" id="colorEn" formControlName="en" class="form-control" placeholder="Enter color in English" />
        </div>

        <div formGroupName="color" class="form-group">
          <label for="colorAr">Color (Arabic)</label>
          <input type="text" id="colorAr" formControlName="ar" class="form-control" placeholder="Enter color in Arabic" />
        </div>

        <div formGroupName="price" class="form-group">
          <label for="currentPrice">Price</label>
          <input type="number" id="currentPrice" formControlName="currentPrice" class="form-control" placeholder="Enter price" />
        </div>

        <div formGroupName="price" class="form-group">
          <label for="currency">Currency</label>
          <input type="text" id="currency" formControlName="currency" class="form-control" placeholder="Enter currency" />
        </div>

        <div class="form-group">
          <label>Options</label>
          <div formArrayName="options">
            <div *ngFor="let option of optionsArray.controls; let i=index">
              <div class="option-row">
                <input [formControlName]="i" placeholder="Option value">
                <button type="button" (click)="removeOption(i)">Remove</button>
              </div>
            </div>
          </div>
          <button type="button" (click)="addOption()">Add Option</button>
        </div>

        <div class="form-group">
          <label>Prices</label>
          <div formArrayName="prices">
            <div *ngFor="let price of pricesArray.controls; let i=index">
              <div class="price-row">
                <input type="number" [formControlName]="i" placeholder="Price">
                <button type="button" (click)="removePrice(i)">Remove</button>
              </div>
            </div>
          </div>
          <button type="button" (click)="addPrice()">Add Price</button>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
          <button type="submit" [disabled]="variantForm.invalid">Submit</button>
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
  `]
})
export class VariantManagementComponent implements OnInit {
  @Input() productId!: string;
  @Input() productName!: string;
  @Input() variants: IVariant[] = [];
  variantForm!: FormGroup;
  showForm = false;
  editingVariantId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.productId = id ? id : '';
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });
  }

  private initForm() {
    this.variantForm = this.fb.group({
      color: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      price: this.fb.group({
        currency: ['', Validators.required],
        currentPrice: [0, [Validators.required, Validators.min(0)]],
        discounted: [false],
      }),
      measurement: this.fb.group({
        unit: [''],
        width: [null],
        height: [null],
        depth: [null],
        length: [null],
      }),
      typeName: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      imageAlt: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      short_description: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      images: this.fb.array([]),
    });
  }

  get optionsArray() {
    return this.variantForm.get('options') as FormArray;
  }

  get pricesArray() {
    return this.variantForm.get('prices') as FormArray;
  }

  loadVariants() {
    this.productsService.getProductVariants(this.productId).subscribe({
      next: (variants) => {
        this.variants = variants;
      },
      error: (error) => {
        console.error('Error loading variants:', error);
        this.showError('Failed to load variants');
      }
    });
  }

  addOption() {
    this.optionsArray.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
  }

  addPrice() {
    this.pricesArray.push(this.fb.control('', [Validators.required, Validators.min(0)]));
  }

  removePrice(index: number) {
    this.pricesArray.removeAt(index);
  }

  showAddForm() {
    this.showForm = true;
    this.editingVariantId = null;
    this.variantForm.reset();
    this.optionsArray.clear();
    this.pricesArray.clear();
    this.addOption();
  }

  editVariant(variant: IVariant) {
    this.showForm = true;
    this.editingVariantId = variant._id ?? null;
    
    this.optionsArray.clear();
    this.pricesArray.clear();
    
    this.variantForm.patchValue({
      color: {
        en: variant.color.en,
        ar: variant.color.ar,
      },
      price: {
        currency: variant.price.currency,
        currentPrice: variant.price.currentPrice,
        discounted: variant.price.discounted,
      },
      measurement: {
        unit: variant.measurement?.unit,
        width: variant.measurement?.width,
        height: variant.measurement?.height,
        depth: variant.measurement?.depth,
        length: variant.measurement?.length,
      },
      typeName: {
        en: variant.typeName.en,
        ar: variant.typeName.ar,
      },
      imageAlt: {
        en: variant.imageAlt.en,
        ar: variant.imageAlt.ar,
      },
      short_description: {
        en: variant.short_description.en,
        ar: variant.short_description.ar,
      },
    });
  }

  cancelEdit() {
    this.showForm = false;
    this.editingVariantId = null;
    this.variantForm.reset();
  }

  onSubmit() {
    if (this.variantForm.invalid) {
      console.error('Form is invalid:', this.variantForm.errors);
      return; // Prevent submission
    }

    this.isLoading = true;

    // Construct the variant data from the form
    const variantData: IVariant = {
      name: this.productName,
      color: {
        en: this.variantForm.value.color.en,
        ar: this.variantForm.value.color.ar,
      },
      price: {
        currency: this.variantForm.value.price.currency,
        currentPrice: this.variantForm.value.price.currentPrice,
        discounted: this.variantForm.value.price.discounted,
      },
      measurement: {
        unit: this.variantForm.value.measurement.unit,
        width: this.variantForm.value.measurement.width,
        height: this.variantForm.value.measurement.height,
        depth: this.variantForm.value.measurement.depth,
        length: this.variantForm.value.measurement.length,
      },
      typeName: {
        en: this.variantForm.value.typeName.en,
        ar: this.variantForm.value.typeName.ar,
      },
      imageAlt: {
        en: this.variantForm.value.imageAlt.en,
        ar: this.variantForm.value.imageAlt.ar,
      },
      short_description: {
        en: this.variantForm.value.short_description.en,
        ar: this.variantForm.value.short_description.ar,
      },
      product_details: {
        product_details_paragraphs: {
          en: this.variantForm.value.product_details.product_details_paragraphs.en,
          ar: this.variantForm.value.product_details.product_details_paragraphs.ar,
        },
        expandable_sections: {
          materials_and_care: {
            en: this.variantForm.value.product_details.expandable_sections.materials_and_care.en,
            ar: this.variantForm.value.product_details.expandable_sections.materials_and_care.ar,
          },
          details_certifications: {
            en: this.variantForm.value.product_details.expandable_sections.details_certifications.en,
            ar: this.variantForm.value.product_details.expandable_sections.details_certifications.ar,
          },
          good_to_know: {
            en: this.variantForm.value.product_details.expandable_sections.good_to_know.en,
            ar: this.variantForm.value.product_details.expandable_sections.good_to_know.ar,
          },
          safety_and_compliance: {
            en: this.variantForm.value.product_details.expandable_sections.safety_and_compliance.en,
            ar: this.variantForm.value.product_details.expandable_sections.safety_and_compliance.ar,
          },
          assembly_and_documents: {
            en: this.variantForm.value.product_details.expandable_sections.assembly_and_documents.en,
            ar: this.variantForm.value.product_details.expandable_sections.assembly_and_documents.ar,
          },
        },
      },
      images: this.variantForm.value.images,
    };

    if (this.productId) {
      // Update existing product
      this.productsService.updateProduct(this.productId, variantData).subscribe({
        next: () => {
          this.router.navigate(['/products/vendorPros']); // Redirect after successful update
        },
        error: (error) => {
          console.error('Error updating product:', error);
        }
      });
    } else {
      // Create new product
      this.productsService.createProduct(variantData).subscribe({
        next: () => {
          this.router.navigate(['/products/vendorPros']); // Redirect after successful creation
        },
        error: (error) => {
          console.error('Error creating product:', error);
        }
      });
    }
  }

  deleteVariant(variantId: string) {
    if (confirm('Are you sure you want to delete this variant?')) {
      this.productsService.deleteVariant(this.productId, variantId).subscribe({
        next: () => {
          this.loadVariants();
          this.showSuccess('Variant deleted');
        },
        error: (error) => {
          console.error('Error deleting variant:', error);
          this.showError('Failed to delete variant');
        }
      });
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  loadProduct(id: string) {
    this.productsService.getProductById(id).subscribe(product => {
      this.variantForm.patchValue(product); // Populate the form with product data
    });
  }
}