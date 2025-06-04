import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../Models/iproduct';
import { ProductsWithApiService } from '../../Services/products-with-api.service';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { IVariant } from '../../Models/ivariant';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: "./product.component.scss",
})
export class ProductComponent implements OnInit {
  product!: IProduct;
  productID: string = '';
  prdIDs: string[] = [];
  selectedImage: string | null = null;
  activeTab: string = 'materials_and_care';
  switchTab(tabKey: string): void {
    this.activeTab = tabKey;
  }
  productSections = [
    {
      key: 'materials_and_care',
      title: 'Materials and Care',
      icon: 'fas fa-tshirt',
      isOpen: false,
    },
    {
      key: 'details_certifications',
      title: 'Details & Certifications',
      icon: 'fas fa-certificate',
      isOpen: false,
    },
    {
      key: 'good_to_know',
      title: 'Good to Know',
      icon: 'fas fa-lightbulb',
      isOpen: false,
    },
    {
      key: 'safety_and_compliance',
      title: 'Safety & Compliance',
      icon: 'fas fa-shield-alt',
      isOpen: false,
    },
    {
      key: 'assembly_and_documents',
      title: 'Assembly & Documents',
      icon: 'fas fa-tools',
      isOpen: false,
    },
  ];

  constructor(
    private productsWithApi: ProductsWithApiService,
    private activatedroute: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.activatedroute.paramMap.subscribe((param) => {
      this.productID = param.get('prdID') || '';
      this.activeTab = this.productSections[0].key;
    });
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

  selectImage(img: string): void {
    this.selectedImage = img;
  }

  toggleSection(key: string): void {
    const section = this.productSections.find((s) => s.key === key);
    if (section) {
      section.isOpen = !section.isOpen;
    }
  }

  getSection(key: string): string {
    return (
      this.product?.product_details?.expandable_sections[
        key as keyof typeof this.product.product_details.expandable_sections
      ]?.en || ''
    );
  }
  getCurrentSection() {
    return this.productSections.find(
      (section) => section.key === this.activeTab
    );
  }

  calculateDiscount(price: {
    originalPrice?: number;
    currentPrice: number;
  }): number {
    if (!price.originalPrice) return 0;
    const discount =
      ((price.originalPrice - price.currentPrice) / price.originalPrice) * 100;
    return Math.round(discount);
  }
  editProduct(): void {
    this.router.navigate(['/products/edit', this.productID]);
  }
  viewOnWebsite(): void {
    const url = `${environment.clientURL}/productDetails/${this.productID}`;
    window.open(url, '_blank');
  }

  getStockStatusClass(variant: IVariant): string {
    if (
      !variant.inStock ||
      (variant.stockQuantity !== undefined && variant.stockQuantity <= 0)
    ) {
      return 'out-of-stock';
    }
    if (variant.stockQuantity !== undefined && variant.stockQuantity < 10) {
      return 'low-stock';
    }
    return 'in-stock';
  }

  getStockStatusIcon(variant: IVariant): string {
    if (
      !variant.inStock ||
      (variant.stockQuantity !== undefined && variant.stockQuantity <= 0)
    ) {
      return 'fas fa-times-circle';
    }
    if (variant.stockQuantity !== undefined && variant.stockQuantity < 10) {
      return 'fas fa-exclamation-circle';
    }
    return 'fas fa-check-circle';
  }

  getStockStatusText(variant: IVariant): string {
    if (
      !variant.inStock ||
      (variant.stockQuantity !== undefined && variant.stockQuantity <= 0)
    ) {
      return 'Out of Stock';
    }
    if (variant.stockQuantity !== undefined && variant.stockQuantity < 10) {
      return `Low Stock (${variant.stockQuantity} left)`;
    }
    return `In Stock (${variant.stockQuantity} units)`;
  }

  goback() {
    this.location.back();
  }
}
