import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, CreatePostData } from "../api/postsApi";
import toast from "react-hot-toast";

export const usePosts = (params?: {
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
}) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => {
      const queryParams: any = { ...params };
      if (queryParams.minPrice)
        queryParams.minPrice = Number(queryParams.minPrice);
      if (queryParams.maxPrice)
        queryParams.maxPrice = Number(queryParams.maxPrice);
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "") delete queryParams[key];
      });
      return postsApi.getPosts(queryParams);
    },
  });
};

export const usePost = (id: string | undefined) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getPost(id!),
    enabled: !!id,
  });
};

export const useTrendingPosts = (limit = 10) => {
  return useQuery({
    queryKey: ["trending-posts", limit],
    queryFn: () => postsApi.getTrendingPosts(limit),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-posts"] });
      toast.success("Post created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostData> }) =>
      postsApi.updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-posts"] });
      toast.success("Post deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });
};

export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: () => postsApi.getUserPosts(userId),
    enabled: !!userId,
  });
};
