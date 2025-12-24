import api from "../../../shared/config/api";
import { Order } from "./paymentsApi";

export interface OrdersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Order[];
}

export const ordersApi = {
  getMyOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders", { params });
    return response.data;
  },

  getSellerOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders/seller", {
      params,
    });
    return response.data;
  },

  getOrder: async (
    orderId: string
  ): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get<{ success: boolean; data: Order }>(
      `/orders/${orderId}`
    );
    return response.data;
  },

  checkOrderExists: async (
    postId: string
  ): Promise<{
    success: boolean;
    hasOrder: boolean;
    hasDeliveredOrder?: boolean;
    order?: Order;
  }> => {
    try {
      const response = await ordersApi.getMyOrders({ limit: 100 });
      const order = response.data.find((o) => {
        const orderPostId =
          typeof o.post === "object" && o.post !== null && "_id" in o.post
            ? (o.post as any)._id
            : typeof o.post === "string"
            ? o.post
            : null;
        return orderPostId === postId && o.status !== "cancelled";
      });
      return {
        success: true,
        hasOrder: !!order,
        hasDeliveredOrder: order?.status === "delivered",
        order: order,
      };
    } catch (error) {
      return { success: false, hasOrder: false };
    }
  },
};
