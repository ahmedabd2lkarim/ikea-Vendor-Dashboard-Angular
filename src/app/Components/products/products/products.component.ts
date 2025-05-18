import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsWithApiService } from '../../../Services/products-with-api.service';
import { IProduct } from '../../../Models/iproduct';
import { Icategory } from '../../../Models/icategory';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  categories: Icategory[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  selectedCategory = '';

  constructor(private productsService: ProductsWithApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isLoading = true;
    this.productsService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load products';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  loadCategories() {
    this.productsService.getAllCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (error) => console.error('Error loading categories:', error),
    });
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        !this.searchQuery ||
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory =
        !this.selectedCategory || product.categoryId === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p._id !== id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.error = 'Failed to delete product';
        },
      });
    }
  }
}
