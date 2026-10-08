// ============================================================
// CARTICOM PRODUCTS — Domain Types
// ============================================================

export interface ProductDto {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  images: string[];
  status: ProductStatus;
  inventory: InventoryInfo;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  images?: string[];
  /** Main product image URL — matches the backend CreateProductRequest.imageUrl field. */
  imageUrl?: string;
  /** Top-level stock quantity (backend maps this onto stockQuantity). */
  quantity?: number;
  /** Backend's active flag — status is derived from this + stock level. */
  isActive?: boolean;
  inventory?: {
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
  };
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus;
}

export interface InventoryInfo {
  quantity: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'}