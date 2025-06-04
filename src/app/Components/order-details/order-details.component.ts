import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../Services/cart.service';
import { ICart } from '../../Models/icart';
import { CommonModule } from '@angular/common';
import { ProductsWithApiService } from '../../Services/products-with-api.service';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  items:any[]=[];
  orderId: string | null = null;
  order: any;
  constructor( private activatedroute: ActivatedRoute, private cartService: CartService,private productsApi: ProductsWithApiService) { }
  ngOnInit(): void {
    this.orderId = this.activatedroute.snapshot.paramMap.get("ordID")
    
    this.cartService.getVendorOrders().subscribe(data => {
      this.order = data.find(x => x._id == this.orderId)
      this.items=this.order?.orderItems;
      this.items.forEach(item => {
        if (item.variantId && item.prdID && item.prdID._id) {
          this.productsApi.getProductVariants(item.prdID._id).subscribe(variants => {
            item.variant = variants.find(v => v._id === item.variantId);
          });
        }
      });
      console.log(this.items);
      
    })
  }
}
