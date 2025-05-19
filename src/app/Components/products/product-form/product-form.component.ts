import { Component, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Icategory } from '../../../Models/icategory';
import { ProductsWithApiService } from '../../../Services/products-with-api.service';
import { IProduct } from '../../../Models/iproduct';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VariantManagementComponent } from '../../variants/variant-management.component';
import { IVariant } from '../../../Models/ivariant';

export type ProductFormData = IProduct;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    VariantManagementComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  productId: string | null = null;

  productForm!: FormGroup;
  categories: Icategory[] = [];
  measurementUnits = ['mm', 'cm', 'm', 'inch', 'ft'];
  weightUnits = ['g', 'kg', 'lb', 'oz'];
  isLoading = false;
  showVariantsSection = false;
  showMeasurementSection = false;
  showWeightSection = false;
  showProductDetailsSection = false;
  currentUserId = ''; // This should come from auth service
  variants: any[] = []; // Add this line

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // Getter for variants FormArray
  get variantsArray() {
    return this.productForm.get('variants') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadCurrentUser();

    // Subscribe to route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.productId = id;
        this.isEditMode = true;
        this.loadProductForEdit(id);
      }
    });
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      color: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      price: this.fb.group({
        currency: ['EGP', Validators.required],
        currentPrice: [0, [Validators.required, Validators.min(0.01)]],
        discounted: [false],
      }),
      measurement: this.fb.group({
        width: [null],
        height: [null],
        depth: [null],
        length: [null],
        unit: ['cm', Validators.required],
      }),
      typeName: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      contextualImageUrl: ['', Validators.pattern(/https?:\/\/.+/)],
      images: ['', Validators.required], // Textarea for multiple URLs
      short_description: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
      product_details: this.fb.group({
        product_details_paragraphs: this.fb.group({
          en: [''], // Textarea for multiple paragraphs
          ar: [''], // Textarea for multiple paragraphs
        }),
        expandable_sections: this.fb.group({
          materials_and_care: this.fb.group({
            en: [''],
            ar: [''],
          }),
          details_certifications: this.fb.group({
            en: [''],
            ar: [''],
          }),
          good_to_know: this.fb.group({
            en: [''],
            ar: [''],
          }),
          safety_and_compliance: this.fb.group({
            en: [''],
            ar: [''],
          }),
          assembly_and_documents: this.fb.group({
            en: [''],
            ar: [''],
          }),
        }),
      }),
      vendorId: [this.currentUserId, Validators.required],
      categoryId: ['', Validators.required],
      vendorName: [''],
      categoryName: [''],
      variants: this.fb.array([]),
      inStock: [true],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      weight: this.fb.group({
        value: [null],
        unit: ['kg'],
      }),
      fullUrl: [''],
    });

    // Add custom validator for measurement (at least one field required)
    this.productForm
      .get('measurement')
      ?.setValidators(this.measurementValidator);

    // Update category name when category changes
    this.productForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      const category = this.categories.find((cat) => cat._id === categoryId);
      if (category) {
        // Assuming category has a name property
        this.productForm.patchValue({ categoryName: category.name });
      }
    });
  }

  // Custom validator for measurement - at least one field must be filled
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

  // Load current user from auth service
  loadCurrentUser(): void {
    // TODO: Replace with actual auth service call
    // this.authService.getCurrentUser().subscribe(user => {
    //   this.currentUserId = user.id;
    //   this.productForm.patchValue({ vendorId: this.currentUserId });
    // });

    // Temporary placeholder
    this.currentUserId = 'temp-vendor-id';
    this.productForm.patchValue({ vendorId: this.currentUserId });
  }

  toggleVariantsSection(): void {
    this.showVariantsSection = !this.showVariantsSection;
    // No need to clear variants array as it's managed by the variant component
  }

  toggleMeasurementSection(): void {
    this.showMeasurementSection = !this.showMeasurementSection;
    if (!this.showMeasurementSection) {
      this.productForm.get('measurement')?.reset({
        width: null,
        height: null,
        depth: null,
        length: null,
        unit: 'cm',
      });
    }
    // Update validator when section is toggled
    this.productForm.get('measurement')?.updateValueAndValidity();
  }

  toggleWeightSection(): void {
    this.showWeightSection = !this.showWeightSection;
    if (!this.showWeightSection) {
      this.productForm.get('weight')?.reset({
        value: null,
        unit: 'kg',
      });
    }
  }

  toggleProductDetailsSection(): void {
    this.showProductDetailsSection = !this.showProductDetailsSection;
    if (!this.showProductDetailsSection) {
      this.productForm.get('product_details')?.reset({
        product_details_paragraphs: { en: '', ar: '' },
        expandable_sections: {
          materials_and_care: { en: '', ar: '' },
          details_certifications: { en: '', ar: '' },
          good_to_know: { en: '', ar: '' },
          safety_and_compliance: { en: '', ar: '' },
          assembly_and_documents: { en: '', ar: '' },
        },
      });
    }
  }

  // Variant helper methods for template
  isVariantFieldInvalid(index: number, fieldName: string): boolean {
    const control = this.variantsArray.at(index)?.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  getVariantFieldError(index: number, fieldName: string): string {
    const control = this.variantsArray.at(index)?.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min'])
        return `Minimum value is ${control.errors['min'].min}`;
    }
    return '';
  }

  // Helper method to convert textarea to array
  private textareaToArray(text: string): string[] {
    if (!text || text.trim() === '') return [];
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  // Helper method to convert array to textarea
  private arrayToTextarea(array: string[] | undefined): string {
    if (!array || array.length === 0) return '';
    return array.join('\n');
  }

  loadCategories(): void {
    this.productsService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadProductForEdit(id: string): void {
    this.isLoading = true;
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        console.log('Loaded product:', product);
        this.populateForm(product);
        // Set variants if they exist
        if (product.variants) {
          this.variants = product.variants;
        }
        this.isLoading = false;
        this.snackBar.open('Product loaded successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load product', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  populateForm(product: IProduct): void {
    // Convert images array to textarea format
    const imagesText = product.images ? product.images.join('\n') : '';

    // Convert product details paragraphs to textarea format
    const enParagraphsText = this.arrayToTextarea(
      product.product_details?.product_details_paragraphs?.en
    );
    const arParagraphsText = this.arrayToTextarea(
      product.product_details?.product_details_paragraphs?.ar
    );

    // Populate form with product data
    this.productForm.patchValue({
      name: product.name || '',
      color: product.color || { en: '', ar: '' },
      price: {
        currency: product.price?.currency || 'EGP',
        currentPrice: product.price?.currentPrice || 0,
        discounted: product.price?.discounted || false,
      },
      measurement: product.measurement || {
        width: null,
        height: null,
        depth: null,
        length: null,
        unit: 'cm',
      },
      typeName: product.typeName || { en: '', ar: '' },
      contextualImageUrl: product.contextualImageUrl || '',
      images: imagesText,
      short_description: product.short_description || { en: '', ar: '' },
      product_details: {
        product_details_paragraphs: {
          en: enParagraphsText,
          ar: arParagraphsText,
        },
        expandable_sections: product.product_details?.expandable_sections || {
          materials_and_care: { en: '', ar: '' },
          details_certifications: { en: '', ar: '' },
          good_to_know: { en: '', ar: '' },
          safety_and_compliance: { en: '', ar: '' },
          assembly_and_documents: { en: '', ar: '' },
        },
      },
      vendorId: product.vendorId || this.currentUserId,
      categoryId: product.categoryId || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockQuantity: product.stockQuantity || 0,
      weight: product.weight || { value: null, unit: 'kg' },
      fullUrl: product.fullUrl || '',
    });

    // Handle variants if they exist
    if (product.variants && product.variants.length > 0) {
      this.showVariantsSection = true;
      this.variantsArray.clear();
      product.variants.forEach((variant: any) => {
        const variantControl = this.createVariantControl();
        variantControl.patchValue(variant);
        this.variantsArray.push(variantControl);
      });
    }

    // Show optional sections if they have data
    this.showMeasurementSection = !!(
      product.measurement &&
      (product.measurement.width ||
        product.measurement.height ||
        product.measurement.depth ||
        product.measurement.length)
    );

    this.showWeightSection = !!(product.weight && product.weight.value);

    this.showProductDetailsSection = !!(
      product.product_details &&
      (enParagraphsText ||
        arParagraphsText ||
        Object.values(product.product_details.expandable_sections || {}).some(
          (section) => section.en || section.ar
        ))
    );
  }

  // onSubmit(): void {
  //   if (this.productForm.invalid) {
  //     this.markFormGroupTouched(this.productForm);
  //     this.showError('Please fill in all required fields');
  //     return;
  //   }

  //   this.isLoading = true;
  //   const formData = this.prepareFormData();

  //   if (this.isEditMode && this.productId) {
  //     this.updateProduct(formData);
  //   } else {
  //     this.createProduct(formData);
  //   }
  // }

  // // Update prepareFormData to properly handle all fields
  // prepareFormData(): Partial<IProduct> {
  //   const formValue = this.productForm.value;
  //   const images = this.textareaToArray(formValue.images);

  //   const productData: Partial<IProduct> = {
  //     name: formValue.name,
  //     color: formValue.color,
  //     price: formValue.price,
  //     typeName: formValue.typeName,
  //     images: images,
  //     short_description: formValue.short_description,
  //     vendorId: formValue.vendorId,
  //     categoryId: formValue.categoryId,
  //     inStock: formValue.inStock,
  //     stockQuantity: formValue.stockQuantity,
  //     variants: this.variants || [],
  //     // Add measurement if section is shown
  //     ...(this.showMeasurementSection && {
  //       measurement: {
  //         unit: formValue.measurement.unit,
  //         width: formValue.measurement.width || undefined,
  //         height: formValue.measurement.height || undefined,
  //         depth: formValue.measurement.depth || undefined,
  //         length: formValue.measurement.length || undefined
  //       }
  //     }),
  //     // Add weight if section is shown
  //     ...(this.showWeightSection && formValue.weight.value && {
  //       weight: formValue.weight
  //     }),
  //     // Add product details if section is shown
  //     ...(this.showProductDetailsSection && {
  //       product_details: {
  //         product_details_paragraphs: {
  //           en: this.textareaToArray(formValue.product_details.product_details_paragraphs.en),
  //           ar: this.textareaToArray(formValue.product_details.product_details_paragraphs.ar)
  //         },
  //         expandable_sections: formValue.product_details.expandable_sections
  //       }
  //     }),
  //     // Add contextual image URL if provided
  //     ...(formValue.contextualImageUrl && {
  //       contextualImageUrl: formValue.contextualImageUrl
  //     })
  //   };

  //   return productData;
  // }

  // Add helper method for form validation messages

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = this.prepareFormData();

      if (this.isEditMode && this.productId) {
        this.updateProduct(formData);
      } else {
        this.createProduct(formData);
      }
    } else {
      this.markFormGroupTouched(this.productForm);
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  prepareFormData(): Partial<IProduct> {
    const formValue = this.productForm.value;
    const images = this.textareaToArray(formValue.images);

    const productData: Partial<IProduct> = {
      name: formValue.name,
      color: formValue.color,
      price: formValue.price,
      typeName: formValue.typeName,
      images: images,
      short_description: formValue.short_description,
      vendorId: formValue.vendorId,
      categoryId: formValue.categoryId,
      inStock: formValue.inStock,
      stockQuantity: formValue.stockQuantity,
      variants: this.variants || [],
      // Add measurement if section is shown
      ...(this.showMeasurementSection && {
        measurement: {
          unit: formValue.measurement.unit,
          width: formValue.measurement.width || undefined,
          height: formValue.measurement.height || undefined,
          depth: formValue.measurement.depth || undefined,
          length: formValue.measurement.length || undefined,
        },
      }),
      // Add weight if section is shown
      ...(this.showWeightSection &&
        formValue.weight.value && {
          weight: formValue.weight,
        }),
      // Add product details if section is shown
      ...(this.showProductDetailsSection && {
        product_details: {
          product_details_paragraphs: {
            en: this.textareaToArray(
              formValue.product_details.product_details_paragraphs.en
            ),
            ar: this.textareaToArray(
              formValue.product_details.product_details_paragraphs.ar
            ),
          },
          expandable_sections: formValue.product_details.expandable_sections,
        },
      }),
      // Add contextual image URL if provided
      ...(formValue.contextualImageUrl && {
        contextualImageUrl: formValue.contextualImageUrl,
      }),
    };

    return productData;
  }

  createProduct(productData: Partial<IProduct>): void {
    this.isLoading = true;
    this.productsService.createProduct(productData).subscribe({
      next: (response) => {
        console.log('Product created successfully:', response);
        this.snackBar.open('Product created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['/products/vendorPros']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to create product',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  updateProduct(productData: Partial<IProduct>): void {
    if (!this.productId) {
      this.showError('Product ID is missing');
      return;
    }

    this.isLoading = true;
    this.productsService.updateProduct(this.productId, productData).subscribe({
      next: (response) => {
        console.log('Product updated successfully:', response);
        this.showSuccess('Product updated successfully');
        this.router.navigate(['/products/vendorPros']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showError(error.error?.message || 'Failed to update product');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Add these helper methods if not already present
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  private showValidationErrors(): void {
    const controls = this.productForm.controls;
    let errorMessage = 'Please check the following fields:\n';

    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      if (control.errors) {
        errorMessage += `- ${key}\n`;
      }
    });

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products/vendorPros']);
  }

  // Helper methods for template
  getFieldError(fieldPath: string): string {
    const control = this.getNestedControl(fieldPath);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min'])
        return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['pattern']) return 'Invalid format';
      if (control.errors['requireAtLeastOne'])
        return 'At least one measurement field is required';
    }
    return '';
  }

  private getNestedControl(path: string): AbstractControl | null {
    let control: AbstractControl | null = this.productForm;

    for (const key of path.split('.')) {
      control = control?.get(key) || null;
      if (!control) break;
    }

    return control;
  }

  private createVariantControl(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      inStock: [true],
      images: ['', Validators.required],
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const control = this.getNestedControl(fieldPath);
    return !!(control?.invalid && control.touched);
  }

  // Helper method to get field values for template
  getFieldValue(fieldPath: string): any {
    const control = this.getNestedControl(fieldPath);
    return control?.value;
  }

  // Helper method to check if measurement section has errors
  isMeasurementSectionInvalid(): boolean {
    const measurementControl = this.productForm.get('measurement');
    return !!(
      measurementControl?.errors?.['requireAtLeastOne'] &&
      measurementControl?.touched
    );
  }

  // Add method to handle variant changes
  onVariantsChange(variants: IVariant[]) {
    this.variants = variants;
    this.productForm.patchValue({ variants: variants });
  }
}
