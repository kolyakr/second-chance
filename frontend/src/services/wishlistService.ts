import api from "../config/api";

export interface WishlistItem {
  _id: string;
  user: string;
  post: any;
  createdAt: string;
}

export const wishlistService = {
  addToWishlist: async (postId: string): Promise<{ success: boolean; data: WishlistItem }> => {
    const response = await api.post("/wishlist", { postId });
    return response.data;
  },

  removeFromWishlist: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/wishlist/${postId}`);
    return response.data;
  },

  getWishlist: async (): Promise<{ success: boolean; count: number; data: WishlistItem[] }> => {
    const response = await api.get("/wishlist");
    return response.data;
  },

  checkWishlist: async (postId: string): Promise<{ success: boolean; isInWishlist: boolean }> => {
    const response = await api.get(`/wishlist/check/${postId}`);
    return response.data;
  },
};

