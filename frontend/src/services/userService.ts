import api from "../config/api";

export interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  telegram?: string;
  phone?: string;
  role: string;
  followers: User[];
  following: User[];
  stats?: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  isFollowing?: boolean;
}

export const userService = {
  getUserProfile: async (
    id: string
  ): Promise<{ success: boolean; data: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    avatar?: string;
    telegram?: string;
    phone?: string;
  }): Promise<{ success: boolean; data: User }> => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  toggleFollow: async (
    userId: string
  ): Promise<{ success: boolean; following: boolean; message: string }> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getSavedPosts: async (): Promise<{
    success: boolean;
    count: number;
    data: any[];
  }> => {
    const response = await api.get("/users/saved");
    return response.data;
  },

  toggleSavePost: async (
    postId: string
  ): Promise<{ success: boolean; saved: boolean; message: string }> => {
    const response = await api.post(`/users/save/${postId}`);
    return response.data;
  },

  getDashboard: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get("/users/dashboard");
    return response.data;
  },
};
