// ============================================================
// CARTICOM CUSTOMERS — Domain Types
// ============================================================

export interface CustomerDto {
  id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: CustomerStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  status?: CustomerStatus;
  /** Backend stores a single `name` field (responses split it into first/last). */
  name?: string;
  address?: string;
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'}