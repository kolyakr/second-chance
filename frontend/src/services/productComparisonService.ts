import api from "../config/api";
import { Post } from "./postService";

export interface ProductComparison {
  _id: string;
  user: string;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
}

export const productComparisonService = {
  addToComparison: async (postId: string): Promise<{ success: boolean; data: ProductComparison }> => {
    const response = await api.post("/comparison", { postId });
    return response.data;
  },

  removeFromComparison: async (postId: string): Promise<{ success: boolean; message: string; data: ProductComparison | null }> => {
    const response = await api.delete(`/comparison/${postId}`);
    return response.data;
  },

  getComparison: async (): Promise<{ success: boolean; data: ProductComparison | { posts: [] } }> => {
    const response = await api.get("/comparison");
    return response.data;
  },

  clearComparison: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete("/comparison");
    return response.data;
  },
};

