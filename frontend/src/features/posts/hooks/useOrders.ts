import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/ordersApi";

export const useMyOrders = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["my-orders", params],
    queryFn: () => ordersApi.getMyOrders(params),
  });
};

export const useSellerOrders = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["seller-orders", params],
    queryFn: () => ordersApi.getSellerOrders(params),
  });
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: !!orderId,
  });
};

export const useCheckOrderExists = (postId: string | undefined) => {
  return useQuery({
    queryKey: ["check-order", postId],
    queryFn: () => ordersApi.checkOrderExists(postId!),
    enabled: !!postId,
  });
};
