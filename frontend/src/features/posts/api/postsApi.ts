import api from "../../../shared/config/api";

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
    telegram?: string;
    phone?: string;
  };
  title: string;
  description: string;
  images: string[];
  category: "men" | "women" | "children" | "accessories" | "footwear";
  subcategory?: string;
  size?: string;
  brand?: string;
  material?: string;
  condition: "new" | "like-new" | "used" | "with-defects";
  conditionDetails?: string;
  price?: number;
  color?: string;
  season?: string[];
  tags: string[];
  location?: string;
  isPublic: boolean;
  status: "active" | "sold" | "archived";
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface CreatePostData {
  title: string;
  description: string;
  images: string[];
  category: "men" | "women" | "children" | "accessories" | "footwear";
  subcategory?: string;
  size?: string;
  brand?: string;
  material?: string;
  condition: "new" | "like-new" | "used" | "with-defects";
  conditionDetails?: string;
  price?: number;
  color?: string;
  season?: string[];
  tags: string[];
  location?: string;
  isPublic?: boolean;
}

export interface PostsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Post[];
}

export const postsApi = {
  getPosts: async (params?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    season?: string;
    size?: string;
    brand?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<PostsResponse> => {
    const response = await api.get<PostsResponse>("/posts", { params });
    return response.data;
  },

  getPost: async (id: string): Promise<{ success: boolean; data: Post }> => {
    const response = await api.get<{ success: boolean; data: Post }>(
      `/posts/${id}`
    );
    return response.data;
  },

  getTrendingPosts: async (
    limit = 10
  ): Promise<{ success: boolean; count: number; data: Post[] }> => {
    const response = await api.get("/posts/trending", { params: { limit } });
    return response.data;
  },

  createPost: async (
    data: CreatePostData
  ): Promise<{ success: boolean; data: Post }> => {
    const response = await api.post<{ success: boolean; data: Post }>(
      "/posts",
      data
    );
    return response.data;
  },

  updatePost: async (
    id: string,
    data: Partial<CreatePostData>
  ): Promise<{ success: boolean; data: Post }> => {
    const response = await api.put<{ success: boolean; data: Post }>(
      `/posts/${id}`,
      data
    );
    return response.data;
  },

  deletePost: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  getUserPosts: async (
    userId: string
  ): Promise<{ success: boolean; count: number; data: Post[] }> => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },
};
