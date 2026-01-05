import api from "../config/api";

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post: string;
  postOwner: string;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  count: number;
  data: Review[];
}

export interface UserReviewsResponse {
  success: boolean;
  count: number;
  averageRating: string;
  data: Review[];
}

export const reviewService = {
  createReview: async (data: {
    postId: string;
    rating: number;
    comment?: string;
    photos?: string[];
  }): Promise<{ success: boolean; data: Review }> => {
    const response = await api.post<{ success: boolean; data: Review }>(
      "/reviews",
      data
    );
    return response.data;
  },

  getPostReviews: async (postId: string): Promise<ReviewsResponse> => {
    const response = await api.get<ReviewsResponse>(`/reviews/post/${postId}`);
    return response.data;
  },

  getUserReviews: async (userId: string): Promise<UserReviewsResponse> => {
    const response = await api.get<UserReviewsResponse>(
      `/reviews/user/${userId}`
    );
    return response.data;
  },

  updateReview: async (
    id: string,
    data: { rating?: number; comment?: string; photos?: string[] }
  ): Promise<{ success: boolean; data: Review }> => {
    const response = await api.put<{ success: boolean; data: Review }>(
      `/reviews/${id}`,
      data
    );
    return response.data;
  },

  deleteReview: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};
