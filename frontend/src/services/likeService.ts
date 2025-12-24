import api from "../config/api";

export const likeService = {
  toggleLike: async (
    postId: string
  ): Promise<{ success: boolean; liked: boolean; message: string }> => {
    const response = await api.post(`/likes/${postId}`);
    return response.data;
  },

  getUserLikes: async (): Promise<{
    success: boolean;
    count: number;
    data: any[];
  }> => {
    const response = await api.get("/likes/user");
    return response.data;
  },

  checkLike: async (
    postId: string
  ): Promise<{ success: boolean; liked: boolean }> => {
    const response = await api.get(`/likes/${postId}`);
    return response.data;
  },
};
