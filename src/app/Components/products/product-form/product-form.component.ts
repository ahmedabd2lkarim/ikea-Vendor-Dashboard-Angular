import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Icategory } from '../../../Models/icategory';
import { ProductsWithApiService } from '../../../Services/products-with-api.service';

export interface ProductFormData {
  _id?: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  images: string[];
  price: {
    currentPrice: number;
    currency?: string;
  };
  stockQuantity: number;
  inStock: boolean;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  categoryName: string;
  measurement: string;
  unit: string;
  variants: Array<{
    name: string;
    value: string;
    price?: number;
    stockQuantity?: number;
  }>;
}

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
  availableUnits = ['piece', 'kg', 'gram', 'liter', 'ml', 'box', 'pack'];
  isLoading = false;
  showVariantsSection = false;
  
  constructor(
    private fb: FormBuilder,
    private productsService: ProductsWithApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    
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
      name: this.fb.group({
        en: ['', Validators.required],
        ar: ['']
      }),
      description: this.fb.group({
        en: ['', Validators.required],
        ar: ['']
      }),
      images: this.fb.array([this.createImageControl()]),
      price: this.fb.group({
        currentPrice: [0, [Validators.required, Validators.min(0.01)]],
        currency: ['EGP']
      }),
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      inStock: [true],
      vendorId: ['', Validators.required],
      vendorName: ['', Validators.required],
      categoryId: ['', Validators.required],
      categoryName: [''],
      measurement: [''],
      unit: ['piece', Validators.required],
      variants: this.fb.array([])
    });

    // Update category name when category changes
    this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      const category = this.categories.find(cat => cat._id === categoryId);
      this.productForm.patchValue({ categoryName: category?.name || '' });
    });
  }

  // Images FormArray methods
  get imagesArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  getImageControls(): FormGroup[] {
    return this.imagesArray.controls as FormGroup[];
  }

  createImageControl(): FormGroup {
    return this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
      alt: ['']
    });
  }

  addImageField(): void {
    this.imagesArray.push(this.createImageControl());
  }

  removeImageField(index: number): void {
    if (this.imagesArray.length > 1) {
      this.imagesArray.removeAt(index);
    }
  }

  // Image helper methods for template
  getImageUrl(index: number): string {
    const control = this.imagesArray.at(index);
    return control?.get('url')?.value || '';
  }

  getImageAlt(index: number): string {
    const control = this.imagesArray.at(index);
    return control?.get('alt')?.value || '';
  }

  isImageFieldInvalid(index: number, fieldName: string): boolean {
    const control = this.imagesArray.at(index)?.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  getImageFieldError(index: number, fieldName: string): string {
    const control = this.imagesArray.at(index)?.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['pattern']) return 'Please enter a valid URL';
    }
    return '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'block';
    }
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

  // Currency helper method
  getCurrentCurrency(): string {
    return this.productForm.get('price')?.get('currency')?.value || 'EGP';
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

  populateForm(product: any): void {
    // Handle the case where product might not have localized fields
    const name = typeof product.name === 'string' 
      ? { en: product.name, ar: '' }
      : product.name || { en: '', ar: '' };

    const description = typeof product.description === 'string'
      ? { en: product.description, ar: '' }
      : product.description || { en: '', ar: '' };

    // Clear existing images and populate with product images
    this.imagesArray.clear();
    if (product.images && product.images.length > 0) {
      product.images.forEach((imageUrl: string) => {
        const imageControl = this.createImageControl();
        imageControl.patchValue({ url: imageUrl, alt: product.imageAlt || '' });
        this.imagesArray.push(imageControl);
      });
    } else if (product.image) {
      const imageControl = this.createImageControl();
      imageControl.patchValue({ url: product.image, alt: product.imageAlt || '' });
      this.imagesArray.push(imageControl);
    }

    // Populate form with product data
    this.productForm.patchValue({
      name: name,
      description: description,
      price: {
        currentPrice: product.price?.currentPrice || 0,
        currency: product.price?.currency || 'EGP'
      },
      stockQuantity: product.stockQuantity || 0,
      inStock: product.inStock !== undefined ? product.inStock : true,
      vendorId: product.vendorId || '',
      vendorName: product.vendorName || '',
      categoryId: product.categoryId || '',
      measurement: product.measurement || '',
      unit: product.unit || 'piece'
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

  prepareFormData(): any {
    const formValue = this.productForm.value;
    
    // Extract image URLs from the form array
    const images = formValue.images
      .map((img: any) => img.url)
      .filter((url: string) => url && url.trim() !== '');
    
    return {
      ...formValue,
      images: images,
      // Keep the primary image for backward compatibility
      image: images[0] || '',
      imageAlt: formValue.images[0]?.alt || '',
      // Ensure variants is empty array if not used
      variants: this.showVariantsSection ? formValue.variants : []
    };
  }

  createProduct(productData: any): void {
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

  updateProduct(productData: any): void {
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
}