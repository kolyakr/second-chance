import api from "../config/api";
import { Post } from "./postService";

export interface ViewHistoryItem {
  _id: string;
  user: string;
  post: Post;
  viewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const viewHistoryService = {
  addToViewHistory: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/view-history", { postId });
    return response.data;
  },

  getViewHistory: async (limit?: number): Promise<{ success: boolean; count: number; data: ViewHistoryItem[] }> => {
    const response = await api.get("/view-history", { params: { limit } });
    return response.data;
  },

  clearViewHistory: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete("/view-history");
    return response.data;
  },
};

