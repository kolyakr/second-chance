import api from "../../../shared/config/api";

export interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderData {
  postId: string;
  deliveryAddress: DeliveryAddress;
}

export interface Order {
  _id: string;
  post:
    | string
    | { _id: string; title: string; images: string[]; price: number };
  buyer:
    | string
    | { _id: string; username: string; avatar?: string; email?: string };
  seller:
    | string
    | { _id: string; username: string; avatar?: string; email?: string };
  deliveryAddress: DeliveryAddress;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  totalAmount: number;
  createdAt: string;
}

export const paymentsApi = {
  createOrder: async (
    data: CreateOrderData
  ): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.post<{
      success: boolean;
      data: Order;
      message: string;
    }>("/orders", data);
    return response.data;
  },

  createPaymentIntent: async (
    orderId: string
  ): Promise<{
    success: boolean;
    data: { clientSecret: string; paymentIntentId: string };
  }> => {
    const response = await api.post<{
      success: boolean;
      data: { clientSecret: string; paymentIntentId: string };
    }>("/payments/create-intent", { orderId });
    return response.data;
  },

  confirmPayment: async (
    paymentIntentId: string
  ): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.post<{
      success: boolean;
      data: Order;
      message: string;
    }>("/payments/confirm", { paymentIntentId });
    return response.data;
  },
};
