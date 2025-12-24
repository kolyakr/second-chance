import api from "../config/api";

export interface AnalyzeImagesResponse {
  success: boolean;
  data: {
    category?: string;
    subcategory?: string;
    color?: string;
    brand?: string;
    material?: string;
    condition?: string;
    style?: string;
    suggestedTags?: string[];
  };
}

export interface GenerateDescriptionResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
  };
}

export interface EnhanceSearchResponse {
  success: boolean;
  data: {
    category?: string;
    condition?: string[];
    tags?: string[];
    color?: string;
    season?: string[];
    material?: string;
    searchTerms?: string;
  };
}

export const geminiService = {
  generateDescription: async (data: {
    imagePaths: string[];
    category?: string;
    condition?: string;
    brand?: string;
    material?: string;
    color?: string;
  }): Promise<GenerateDescriptionResponse> => {
    const response = await api.post<GenerateDescriptionResponse>(
      "/gemini/generate-description",
      data
    );
    return response.data;
  },

  analyzeImages: async (
    imagePaths: string[]
  ): Promise<AnalyzeImagesResponse> => {
    const response = await api.post<AnalyzeImagesResponse>(
      "/gemini/analyze-images",
      { imagePaths }
    );
    return response.data;
  },

  enhanceSearch: async (query: string): Promise<EnhanceSearchResponse> => {
    const response = await api.post<EnhanceSearchResponse>(
      "/gemini/enhance-search",
      { query }
    );
    return response.data;
  },
};
