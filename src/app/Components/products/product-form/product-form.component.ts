import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Icategory } from '../../../Models/icategory';
import { ProductsWithApiService } from '../../../Services/products-with-api.service';
import { IProduct } from '../../../Models/iproduct';

export type ProductFormData = IProduct; 

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() productId: string | null = null;

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
  
  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadCurrentUser();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = params['id'];
        this.isEditMode = true;
        this.loadProductForEdit();
      }
    });
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      color: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      price: this.fb.group({
        currency: ['EGP', Validators.required],
        currentPrice: [0, [Validators.required, Validators.min(0.01)]],
        discounted: [false]
      }),
      measurement: this.fb.group({
        width: [null],
        height: [null],
        depth: [null],
        length: [null],
        unit: ['cm', Validators.required]
      }),
      typeName: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      contextualImageUrl: ['', Validators.pattern(/https?:\/\/.+/)],
      images: ['', Validators.required], // Textarea for multiple URLs
      short_description: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      product_details: this.fb.group({
        product_details_paragraphs: this.fb.group({
          en: [''], // Textarea for multiple paragraphs
          ar: ['']  // Textarea for multiple paragraphs
        }),
        expandable_sections: this.fb.group({
          materials_and_care: this.fb.group({
            en: [''],
            ar: ['']
          }),
          details_certifications: this.fb.group({
            en: [''],
            ar: ['']
          }),
          good_to_know: this.fb.group({
            en: [''],
            ar: ['']
          }),
          safety_and_compliance: this.fb.group({
            en: [''],
            ar: ['']
          }),
          assembly_and_documents: this.fb.group({
            en: [''],
            ar: ['']
          })
        })
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
        unit: ['kg']
      }),
      fullUrl: ['']
    });

    // Add custom validator for measurement (at least one field required)
    this.productForm.get('measurement')?.setValidators(this.measurementValidator);

    // Update category name when category changes
    this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      const category = this.categories.find(cat => cat._id === categoryId);
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

  // Variants FormArray methods
  get variantsArray(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getVariantControls(): FormGroup[] {
    return this.variantsArray.controls as FormGroup[];
  }

  createVariantControl(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      price: [null, Validators.min(0)],
      stockQuantity: [null, Validators.min(0)]
    });
  }

  addVariant(): void {
    this.variantsArray.push(this.createVariantControl());
  }

  removeVariant(index: number): void {
    this.variantsArray.removeAt(index);
  }

  toggleVariantsSection(): void {
    this.showVariantsSection = !this.showVariantsSection;
    if (!this.showVariantsSection) {
      this.variantsArray.clear();
    }
  }

  toggleMeasurementSection(): void {
    this.showMeasurementSection = !this.showMeasurementSection;
    if (!this.showMeasurementSection) {
      this.productForm.get('measurement')?.reset({
        width: null,
        height: null,
        depth: null,
        length: null,
        unit: 'cm'
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
        unit: 'kg'
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
          assembly_and_documents: { en: '', ar: '' }
        }
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
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    }
    return '';
  }

  // Helper method to convert textarea to array
  private textareaToArray(text: string): string[] {
    if (!text || text.trim() === '') return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
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
      }
    });
  }

  loadProductForEdit(): void {
    if (!this.productId) return;

    this.isLoading = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.populateForm(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      }
    });
  }

  populateForm(product: IProduct): void {
    // Convert images array to textarea format
    const imagesText = product.images ? product.images.join('\n') : '';
    
    // Convert product details paragraphs to textarea format
    const enParagraphsText = this.arrayToTextarea(product.product_details?.product_details_paragraphs?.en);
    const arParagraphsText = this.arrayToTextarea(product.product_details?.product_details_paragraphs?.ar);

    // Populate form with product data
    this.productForm.patchValue({
      name: product.name || '',
      color: product.color || { en: '', ar: '' },
      price: {
        currency: product.price?.currency || 'EGP',
        currentPrice: product.price?.currentPrice || 0,
        discounted: product.price?.discounted || false
      },
      measurement: product.measurement || {
        width: null,
        height: null,
        depth: null,
        length: null,
        unit: 'cm'
      },
      typeName: product.typeName || { en: '', ar: '' },
      contextualImageUrl: product.contextualImageUrl || '',
      images: imagesText,
      short_description: product.short_description || { en: '', ar: '' },
      product_details: {
        product_details_paragraphs: {
          en: enParagraphsText,
          ar: arParagraphsText
        },
        expandable_sections: product.product_details?.expandable_sections || {
          materials_and_care: { en: '', ar: '' },
          details_certifications: { en: '', ar: '' },
          good_to_know: { en: '', ar: '' },
          safety_and_compliance: { en: '', ar: '' },
          assembly_and_documents: { en: '', ar: '' }
        }
      },
      vendorId: product.vendorId || this.currentUserId,
      categoryId: product.categoryId || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockQuantity: product.stockQuantity || 0,
      weight: product.weight || { value: null, unit: 'kg' },
      fullUrl: product.fullUrl || ''
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
    this.showMeasurementSection = !!(product.measurement && 
      (product.measurement.width || product.measurement.height || 
       product.measurement.depth || product.measurement.length));
    
    this.showWeightSection = !!(product.weight && product.weight.value);
    
    this.showProductDetailsSection = !!(product.product_details && 
      (enParagraphsText || arParagraphsText || 
       Object.values(product.product_details.expandable_sections || {}).some(section => 
         section.en || section.ar)));
  }

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
    }
  }

  prepareFormData(): Partial<IProduct> {
    const formValue = this.productForm.value;
    
    // Convert images textarea to array
    const images = this.textareaToArray(formValue.images);
    
    // Convert product details paragraphs textarea to arrays
    const productDetailsParagraphs = {
      en: this.textareaToArray(formValue.product_details.product_details_paragraphs.en),
      ar: this.textareaToArray(formValue.product_details.product_details_paragraphs.ar)
    };

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
      variants: this.showVariantsSection ? formValue.variants : []
    };

    // Add optional fields only if they have values
    if (formValue.contextualImageUrl && formValue.contextualImageUrl.trim() !== '') {
      productData.contextualImageUrl = formValue.contextualImageUrl;
    }

    if (this.showMeasurementSection) {
      const measurement = formValue.measurement;
      if (measurement.width || measurement.height || measurement.depth || measurement.length) {
        productData.measurement = {
          ...measurement,
          // Remove null values
          width: measurement.width || undefined,
          height: measurement.height || undefined,
          depth: measurement.depth || undefined,
          length: measurement.length || undefined
        };
      }
    }

    if (this.showWeightSection && formValue.weight.value) {
      productData.weight = formValue.weight;
    }

    if (this.showProductDetailsSection) {
      const hasContent = productDetailsParagraphs.en.length > 0 || 
                        productDetailsParagraphs.ar.length > 0 ||
                        Object.values(formValue.product_details.expandable_sections).some((section: any) => 
                          section.en || section.ar);
      
      if (hasContent) {
        productData.product_details = {
          product_details_paragraphs: productDetailsParagraphs,
          expandable_sections: formValue.product_details.expandable_sections
        };
      }
    }

    if (formValue.fullUrl && formValue.fullUrl.trim() !== '') {
      productData.fullUrl = formValue.fullUrl;
    }

    return productData;
  }

  createProduct(productData: Partial<IProduct>): void {
    // Note: You'll need to implement this method in your ProductsWithApiService
    console.log('Creating product:', productData);
    // this.productsService.createProduct(productData).subscribe({
    //   next: (response) => {
    //     console.log('Product created successfully');
    //     this.router.navigate(['/products/vendorPros']);
    //   },
    //   error: (error) => {
    //     console.error('Error creating product:', error);
    //     this.isLoading = false;
    //   }
    // });
    
    // Temporary simulation
    setTimeout(() => {
      this.isLoading = false;
      alert('Product would be created (API method not implemented)');
      this.router.navigate(['/products/vendorPros']);
    }, 1000);
  }

  updateProduct(productData: Partial<IProduct>): void {
    // Note: You'll need to implement this method in your ProductsWithApiService
    console.log('Updating product:', productData);
    // this.productsService.updateProduct(this.productId!, productData).subscribe({
    //   next: (response) => {
    //     console.log('Product updated successfully');
    //     this.router.navigate(['/products/vendorPros']);
    //   },
    //   error: (error) => {
    //     console.error('Error updating product:', error);
    //     this.isLoading = false;
    //   }
    // });
    
    // Temporary simulation
    setTimeout(() => {
      this.isLoading = false;
      alert('Product would be updated (API method not implemented)');
      this.router.navigate(['/products/vendorPros']);
    }, 1000);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(field => {
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
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['pattern']) return 'Invalid format';
      if (control.errors['requireAtLeastOne']) return 'At least one measurement field is required';
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
    return !!(measurementControl?.errors?.['requireAtLeastOne'] && measurementControl?.touched);
  }
}