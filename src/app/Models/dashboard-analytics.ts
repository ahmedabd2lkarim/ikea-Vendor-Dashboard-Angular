export interface OrderStatusCount {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface CategoryDistribution {
  categoryName: string;
  productCount: number;
}

export interface InventoryStatus {
  productName: string;
  stockQuantity: number;
}

export interface DashboardAnalytics {
  totalRevenue: number;
  orderStatusCount: OrderStatusCount;
  inventoryLevels: InventoryStatus[];
  categoryDistribution: CategoryDistribution[];
}