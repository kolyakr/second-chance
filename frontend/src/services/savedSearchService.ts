import api from "../config/api";

export interface SavedSearch {
  _id: string;
  user: string;
  name: string;
  filters: {
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
  };
  createdAt: string;
  updatedAt: string;
}

export const savedSearchService = {
  createSavedSearch: async (
    name: string,
    filters: SavedSearch["filters"]
  ): Promise<{ success: boolean; data: SavedSearch }> => {
    const response = await api.post("/saved-searches", { name, filters });
    return response.data;
  },

  getSavedSearches: async (): Promise<{ success: boolean; count: number; data: SavedSearch[] }> => {
    const response = await api.get("/saved-searches");
    return response.data;
  },

  deleteSavedSearch: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/saved-searches/${id}`);
    return response.data;
  },
};

