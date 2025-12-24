import api from "../config/api";

export interface Notification {
  _id: string;
  user: string;
  type: "like" | "comment" | "follow" | "message" | "review";
  relatedUser?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  relatedPost?: {
    _id: string;
    title: string;
    images?: string[];
  };
  relatedComment?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: Notification[];
}

export const notificationService = {
  getNotifications: async (params?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>("/notifications", {
      params,
    });
    return response.data;
  },

  markAsRead: async (
    id: string
  ): Promise<{ success: boolean; data: Notification }> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
