import { BaseRepository } from '@/lib/dal/repository';
import type { OrderDto, CreateOrderDto, UpdateOrderDto } from '@/features/dashboard/types/orders.types';
import type { QueryParams } from '@/lib/dal/types';
import axiosInstance, { extractErrorMessage } from '@/lib/axios';

export class OrdersRepository extends BaseRepository<OrderDto, CreateOrderDto, UpdateOrderDto> {
  constructor() {
    super({
      base: '/api/v1/orders',
      byId: (id) => `/api/v1/orders/${id}`});
  }

  async getByStore(storeId: string, params?: QueryParams) {
    return this.get<OrderDto[]>(`/api/v1/orders/store/${storeId}`, params as Record<string, string | number | boolean>);
  }

  async getByStatus(storeId: string, status: string, params?: QueryParams) {
    return this.get<OrderDto[]>(`/api/v1/orders/store/${storeId}/status/${status}`, params as Record<string, string | number | boolean>);
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await axiosInstance.patch(`/api/v1/orders/${orderId}/status?status=${encodeURIComponent(status)}`);
      return response.data.data as OrderDto;
    } catch (error) {
      // Surface a plain-language message instead of a raw axios error.
      throw new Error(extractErrorMessage(error));
    }
  }
}

export const ordersRepository = new OrdersRepository();
