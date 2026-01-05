import api from "../config/api";

export interface Question {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post: string;
  content: string;
  answer?: string;
  answeredBy?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const questionService = {
  createQuestion: async (
    postId: string,
    content: string
  ): Promise<{ success: boolean; data: Question }> => {
    const response = await api.post("/questions", { postId, content });
    return response.data;
  },

  getPostQuestions: async (postId: string): Promise<{ success: boolean; count: number; data: Question[] }> => {
    const response = await api.get(`/questions/post/${postId}`);
    return response.data;
  },

  answerQuestion: async (
    questionId: string,
    answer: string
  ): Promise<{ success: boolean; data: Question }> => {
    const response = await api.put(`/questions/${questionId}/answer`, { answer });
    return response.data;
  },

  deleteQuestion: async (questionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
};

