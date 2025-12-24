import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { likesApi } from "../api/likesApi";
import toast from "react-hot-toast";

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likesApi.toggleLike(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-posts"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to toggle like");
    },
  });
};

export const useUserLikes = () => {
  return useQuery({
    queryKey: ["user-likes"],
    queryFn: () => likesApi.getUserLikes(),
  });
};
