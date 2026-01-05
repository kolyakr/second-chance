import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Close,
  Share,
  ShoppingCart,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";
import { Post } from "../../services/postService";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { wishlistService } from "../../services/wishlistService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "../../shared/utils/imageUtils";
import toast from "react-hot-toast";

interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
}

const QuickViewModal = ({ open, onClose, post }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if post is in wishlist
  const { data: wishlistCheck } = useQuery({
    queryKey: ["wishlist-check", post?._id],
    queryFn: () => wishlistService.checkWishlist(post!._id),
    enabled: isAuthenticated && !!post?._id,
  });

  const isInWishlist = wishlistCheck?.isInWishlist || false;

  const wishlistMutation = useMutation({
    mutationFn: (postId: string) => {
      if (isInWishlist) {
        return wishlistService.removeFromWishlist(postId);
      }
      return wishlistService.addToWishlist(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-check", post?._id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(isInWishlist ? "Видалено зі списку бажань" : "Додано до списку бажань");
    },
    onError: () => {
      toast.error("Не вдалося оновити список бажань");
    },
  });

  if (!post) return null;

  const handleViewFull = () => {
    onClose();
    navigate(`/posts/${post._id}`);
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб додати до списку бажань");
      return;
    }
    wishlistMutation.mutate(post._id);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
          }}
        >
          <Close />
        </IconButton>

        <Grid container>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: { xs: 300, md: "100%" },
                minHeight: { md: 500 },
                position: "relative",
                bgcolor: "grey.100",
              }}
            >
              <Box
                component="img"
                src={getImageUrl(post.images?.[0])}
                alt={post.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {post.title}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={post.category}
                  color="primary"
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
                <Chip
                  label={post.condition}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
                {post.price && (
                  <Chip
                    label={`${post.price}₴`}
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  flexGrow: 1,
                }}
              >
                {post.description}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  pb: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Avatar src={post.user?.avatar} sx={{ width: 40, height: 40 }}>
                  {post.user?.username?.[0]}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {post.user?.username}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleViewFull}
                  sx={{ py: 1.5 }}
                >
                  Переглянути деталі
                </Button>
                {isAuthenticated && (
                  <IconButton
                    onClick={handleWishlistToggle}
                    color={isInWishlist ? "warning" : "default"}
                    disabled={wishlistMutation.isPending}
                  >
                    {isInWishlist ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                )}
                <IconButton>
                  <Share />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;

