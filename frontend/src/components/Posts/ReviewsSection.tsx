import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Rating,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Star, Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService, Review } from "../../services/reviewService";
import { useAuthStore } from "../../stores/authStore";
import { useCheckOrderExists } from "../../features/posts/hooks/useOrders";
import toast from "react-hot-toast";
import ReviewSkeleton from "../../shared/components/Skeletons/ReviewSkeleton";

interface ReviewsSectionProps {
  postId: string;
  postOwnerId: string;
}

const ReviewsSection = ({ postId, postOwnerId }: ReviewsSectionProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", postId],
    queryFn: () => reviewService.getPostReviews(postId),
  });

  const { data: orderCheck } = useCheckOrderExists(postId);
  const hasDeliveredOrder = orderCheck?.hasDeliveredOrder || false;

  const createReviewMutation = useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: () => {
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      toast.success("Відгук успішно додано");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося додати відгук");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { rating: number; comment?: string };
    }) => reviewService.updateReview(id, data),
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditingReview(null);
      queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      toast.success("Відгук успішно оновлено");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося оновити відгук");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      toast.success("Відгук успішно видалено");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося видалити відгук");
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error("Будь ласка, увійдіть, щоб залишити відгук");
      return;
    }

    createReviewMutation.mutate({
      postId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingReview) {
      updateReviewMutation.mutate({
        id: editingReview._id,
        data: { rating, comment: comment.trim() || undefined },
      });
    }
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей відгук?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const userReview = data?.data.find((r) => r.user._id === user?.id);
  const canReview =
    isAuthenticated &&
    user?.id !== postOwnerId &&
    !userReview &&
    hasDeliveredOrder;

  // Calculate average rating
  const averageRating =
    data?.data && data.data.length > 0
      ? data.data.reduce((sum, review) => sum + review.rating, 0) /
        data.data.length
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Відгуки
          </Typography>
          {data && data.count > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Star
                sx={{ color: "warning.main", fontSize: { xs: 20, sm: 24 } }}
              />
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {averageRating.toFixed(1)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
              >
                ({data.count} {data.count === 1 ? "відгук" : data.count < 5 ? "відгуки" : "відгуків"})
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {canReview && (
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            gutterBottom
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Написати відгук
          </Typography>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              Оцінка
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 5)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Поділіться своїм досвідом..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Відправити відгук
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </Box>
      ) : data?.data && data.data.length > 0 ? (
        <Box>
          {data.data.map((review, index) => (
            <Box key={review._id}>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                <Avatar
                  src={review.user.avatar}
                  sx={{ bgcolor: "primary.light" }}
                >
                  {review.user.username[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {review.user.username}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    {user?.id === review.user._id && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(review)}
                          sx={{ p: 0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(review._id)}
                          sx={{ p: 0.5 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {review.comment && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        mt: 0.5,
                      }}
                    >
                      {review.comment}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              {index < data.data.length - 1 && (
                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
        >
          Поки що немає відгуків. Будьте першим!
        </Typography>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редагувати відгук</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Оцінка
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 5)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Поділіться своїм досвідом..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Скасувати</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updateReviewMutation.isPending}
          >
            Оновити
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReviewsSection;
