import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviewsApi";
import toast from "react-hot-toast";

export const usePostReviews = (postId: string) => {
  return useQuery({
    queryKey: ["reviews", postId],
    queryFn: () => reviewsApi.getPostReviews(postId),
  });
};

export const useUserReviews = (userId: string) => {
  return useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: () => reviewsApi.getUserReviews(userId),
    enabled: !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { postId: string; rating: number; comment?: string }) =>
      reviewsApi.createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.postId],
      });
      toast.success("Review added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add review");
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { rating?: number; comment?: string };
    }) => reviewsApi.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update review");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });
};
