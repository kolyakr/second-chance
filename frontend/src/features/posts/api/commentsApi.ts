import api from "../../../shared/config/api";

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post: string;
  content: string;
  parentComment?: string;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export const commentsApi = {
  getPostComments: async (
    postId: string
  ): Promise<{ success: boolean; count: number; data: Comment[] }> => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },

  createComment: async (data: {
    postId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.post("/comments", data);
    return response.data;
  },

  updateComment: async (
    id: string,
    content: string
  ): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },

  deleteComment: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  reportComment: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/comments/${id}/report`);
    return response.data;
  },
};
