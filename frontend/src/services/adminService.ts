import api from "../config/api";

export interface Analytics {
  overview: {
    totalUsers: number;
    totalPosts: number;
    activePosts: number;
    totalComments: number;
  };
  usersByRole: Array<{ _id: string; count: number }>;
  postsByCategory: Array<{ _id: string; count: number }>;
  postsByCondition: Array<{ _id: string; count: number }>;
  recentUsers: Array<{
    _id: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
  recentPosts: Array<{
    _id: string;
    title: string;
    category: string;
    createdAt: string;
    user?: {
      _id: string;
      username: string;
    };
  }>;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin" | "moderator";
  createdAt: string;
  avatar?: string;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: User[];
}

export interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
  };
  post: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

export interface ReportedCommentsResponse {
  success: boolean;
  count: number;
  data: Comment[];
}

export const adminService = {
  getAnalytics: async (): Promise<{ success: boolean; data: Analytics }> => {
    const response = await api.get<{ success: boolean; data: Analytics }>(
      "/admin/analytics"
    );
    return response.data;
  },

  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/admin/users", { params });
    return response.data;
  },

  toggleBanUser: async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/admin/users/${userId}/ban`);
    return response.data;
  },

  deletePost: async (
    postId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  getReportedComments: async (): Promise<ReportedCommentsResponse> => {
    const response = await api.get<ReportedCommentsResponse>(
      "/admin/comments/reported"
    );
    return response.data;
  },

  deleteComment: async (
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  },
};
