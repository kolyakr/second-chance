import api from "../config/api";

export const uploadService = {
  uploadSingle: async (
    file: File
  ): Promise<{
    success: boolean;
    data: { filename: string; path: string; size: number };
  }> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadMultiple: async (
    files: File[]
  ): Promise<{
    success: boolean;
    count: number;
    data: { filename: string; path: string; size: number }[];
  }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
