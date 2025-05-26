// product-add-edit.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../../../Models/iproduct';
import { ProductsWithApiService } from '../../../Services/products-with-api.service';
import { ProductFormComponent } from '../product-form/product-form.component';


@Component({
  selector: 'app-product-add-edit',
  standalone:true,
  template: `
    <h2>{{ isEdit ? 'Edit Product' : 'Add Product' }}</h2>
    <app-product-form
      [initialData]="product"
      (formSubmit)="handleSubmit($event)"
    ></app-product-form>
  `,
  imports: [ProductFormComponent],
})
export class ProductAddEditComponent implements OnInit {
  isEdit = false;
  product: IProduct | null = null;
  productId: string="";

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsWithApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.isEdit = !!this.productId;

    if (this.isEdit) {
      this.productService.getProductById(this.productId).subscribe((res:IProduct) => {
        this.product = res;
      });
    }
  }
  isLoading = false;

    @ViewChild(ProductFormComponent) productFormComponent!: ProductFormComponent;
  handleSubmit(formData: Partial<IProduct>) {
        this.isLoading = true;
    if (this.isEdit) {
      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => this.router.navigate(['/vendor/products']),
        error: (err) => {
          this.isLoading = false;
          alert('Failed to update product. Please try again.')
        },
      });
    } else {
      this.productService.createProduct(formData).subscribe({

        next: () => {
                    this.productFormComponent.productForm.reset(); 
          this.router.navigate(['/vendor/products'])
        },
        error: (err) => {
          this.isLoading = false;
          alert('Failed to create product. Please try again.')
        },
      });
    }
  }
}
