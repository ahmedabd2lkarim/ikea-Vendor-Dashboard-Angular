import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../Models/iproduct';
import { ProductsWithApiService } from '../../Services/products-with-api.service';
import { Location } from '@angular/common';
// import { VariantManagementComponent } from '../variants/variant-management.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-container" *ngIf="product">
      <button class="back-btn" (click)="goback()">← Back</button>
      
      <div class="product-header">
        <h1>{{product.name}}</h1>
        <div class="product-meta">
          <p>Category: {{product.categoryName}}</p>
          <p>Vendor: {{product.vendorName}}</p>
        </div>
      </div>

      <div class="product-content">
        <div class="product-images">
          <img [src]="product.contextualImageUrl || product.images[0]" 
               [alt]="product.imageAlt.en"
               class="main-image">
          <div class="image-gallery">
            <img *ngFor="let img of product.images" 
                 [src]="img" 
                 [alt]="product.imageAlt.en"
                 class="thumbnail">
          </div>
        </div>

        <div class="product-info">
          <div class="price-stock">
            <h2>{{product.price.currency}} {{product.price.currentPrice}}</h2>
            <span [class.out-of-stock]="!product.inStock">
              {{product.inStock ? 'In Stock' : 'Out of Stock'}}
              ({{product.stockQuantity}} available)
            </span>
          </div>

          <div class="description">
            <h3>Description</h3>
            <p>{{product.short_description.en}}</p>
          </div>

          <div class="measurements" *ngIf="product.measurement">
            <h3>Dimensions</h3>
            <ul>
              <li *ngIf="product.measurement.width">Width: {{product.measurement.width}}{{product.measurement.unit}}</li>
              <li *ngIf="product.measurement.height">Height: {{product.measurement.height}}{{product.measurement.unit}}</li>
              <li *ngIf="product.measurement.depth">Depth: {{product.measurement.depth}}{{product.measurement.unit}}</li>
              <li *ngIf="product.measurement.length">Length: {{product.measurement.length}}{{product.measurement.unit}}</li>
            </ul>
          </div>

          <div class="product-details">
            <h3>Product Details</h3>
            <div *ngFor="let para of product.product_details.product_details_paragraphs.en">
              <p>{{para}}</p>
            </div>

            <div class="expandable-sections">
              <details *ngIf="product.product_details.expandable_sections.materials_and_care.en">
                <summary>Materials and Care</summary>
                <p>{{product.product_details.expandable_sections.materials_and_care.en}}</p>
              </details>

              <details *ngIf="product.product_details.expandable_sections.details_certifications.en">
                <summary>Details & Certifications</summary>
                <p>{{product.product_details.expandable_sections.details_certifications.en}}</p>
              </details>

              <details *ngIf="product.product_details.expandable_sections.good_to_know.en">
                <summary>Good to Know</summary>
                <p>{{product.product_details.expandable_sections.good_to_know.en}}</p>
              </details>

              <details *ngIf="product.product_details.expandable_sections.safety_and_compliance.en">
                <summary>Safety & Compliance</summary>
                <p>{{product.product_details.expandable_sections.safety_and_compliance.en}}</p>
              </details>

              <details *ngIf="product.product_details.expandable_sections.assembly_and_documents.en">
                <summary>Assembly & Documents</summary>
                <p>{{product.product_details.expandable_sections.assembly_and_documents.en}}</p>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- <app-variant-management 
        *ngIf="product" 
        [productId]="product._id"
        [variants]="product.variants">
      </app-variant-management> -->
    </div>
  `,
  styles: [`
    .product-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
      margin-bottom: 2rem;
      padding: 0.5rem 1rem;
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .product-header {
      margin-bottom: 2rem;
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .product-images {
      .main-image {
        width: 100%;
        height: auto;
        margin-bottom: 1rem;
      }

      .image-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.5rem;

        .thumbnail {
          width: 100%;
          height: 80px;
          object-fit: cover;
          cursor: pointer;
        }
      }
    }

    .product-info {
      .price-stock {
        margin-bottom: 1rem;
        
        .out-of-stock {
          color: #dc3545;
        }
      }

      h3 {
        margin: 1.5rem 0 0.5rem;
      }
    }

    .expandable-sections {
      details {
        margin: 0.5rem 0;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;

        summary {
          cursor: pointer;
          padding: 0.5rem;
          font-weight: 500;
        }
      }
    }
  `]
})
export class ProductComponent implements OnInit {
  product!: IProduct;
  productID: string = '';
  prdIDs: string[] = [];

  constructor(
    private productsWithApi: ProductsWithApiService,
    private activatedroute: ActivatedRoute,
    private location: Location
  ) {}
  ngOnInit(): void {
    // get current prdID
    this.activatedroute.paramMap.subscribe((param) => {
      this.productID = param.get('prdID') || '';
    });
    //get ids of products
    this.productsWithApi.getAllProducts().subscribe({
      next: (data) => {
        this.prdIDs = data.map((prd) => prd._id);
      },
    });
    //get product by id
    this.productsWithApi.getProductById(this.productID).subscribe({
      next: (data) => {
        this.product = data;
      },
    });
  }
  goback() {
    this.location.back();
  }
}
