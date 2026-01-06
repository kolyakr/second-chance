import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  IconButton,
} from "@mui/material";
import { Favorite, Visibility, Comment, VisibilityOutlined, FavoriteBorder, Bookmark, BookmarkBorder } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { Post } from "../../services/postService";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistService, WishlistItem } from "../../services/wishlistService";
import { getImageUrl } from "../../shared/utils/imageUtils";
import toast from "react-hot-toast";

interface PostCardProps {
  post: Post;
  onQuickView?: (post: Post) => void;
}

const PostCard = ({ post, onQuickView }: PostCardProps) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [wishlistAnimation, setWishlistAnimation] = useState(false);

  // Check if post is in wishlist
  const { data: wishlistCheck } = useQuery({
    queryKey: ["wishlist-check", post._id],
    queryFn: () => wishlistService.checkWishlist(post._id),
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlistCheck?.isInWishlist || false;

  const wishlistMutation = useMutation<
    { success: boolean; data?: WishlistItem; message?: string },
    Error,
    string
  >({
    mutationFn: async (postId: string) => {
      if (isInWishlist) {
        const result = await wishlistService.removeFromWishlist(postId);
        return { success: result.success, message: result.message };
      }
      const result = await wishlistService.addToWishlist(postId);
      return { success: result.success, data: result.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-check", post._id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(isInWishlist ? "Видалено зі списку бажань" : "Додано до списку бажань");
    },
    onError: () => {
      toast.error("Не вдалося оновити список бажань");
    },
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб додати до списку бажань");
      return;
    }
    setWishlistAnimation(true);
    setTimeout(() => setWishlistAnimation(false), 600);
    wishlistMutation.mutate(post._id);
  };

  return (
    <Card
      component={Link}
      to={`/posts/${post._id}`}
      sx={{
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        borderRadius: 3,
        animation: "fadeInUp 0.5s ease-out",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-12px) scale(1.02)",
          boxShadow: "0px 16px 48px rgba(46, 125, 50, 0.2)",
          "& .post-image": {
            transform: "scale(1.1)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: { xs: 240, sm: 260, md: 280 },
          bgcolor: "grey.200",
        }}
      >
        <CardMedia
          component="img"
          className="post-image"
          image={getImageUrl(post.images?.[0])}
          alt={post.title}
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            transition: "transform 0.5s ease",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/placeholder-image.jpg") {
              target.src = "/placeholder-image.jpg";
            }
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {onQuickView && (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(post);
                }}
                sx={{
                  bgcolor: "rgba(255,255,255,0.95)",
                  "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  p: 1,
                }}
                size="small"
              >
                <VisibilityOutlined fontSize="small" />
              </IconButton>
            )}
            {isAuthenticated && (
              <IconButton
                onClick={handleWishlistClick}
                disabled={wishlistMutation.isPending}
                sx={{
                  bgcolor: isInWishlist ? "rgba(255, 152, 0, 0.95)" : "rgba(255,255,255,0.95)",
                  color: isInWishlist ? "white" : "inherit",
                  p: 1,
                  position: "relative",
                  "&::after": wishlistAnimation ? {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,152,0,0.8) 0%, transparent 70%)",
                    transform: "translate(-50%, -50%)",
                    animation: "spark 0.6s ease-out",
                    "@keyframes spark": {
                      "0%": {
                        width: 0,
                        height: 0,
                        opacity: 1,
                      },
                      "100%": {
                        width: 60,
                        height: 60,
                        opacity: 0,
                      },
                    },
                  } : {},
                }}
                size="small"
                title={isInWishlist ? "Видалити зі списку бажань" : "Додати до списку бажань"}
              >
                {isInWishlist ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
              </IconButton>
            )}
          </Box>
          {post.price && (
            <Chip
              label={`${post.price}₴`}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={post.category}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
          <Chip
            label={post.condition}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          />
        </Box>
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            minHeight: { xs: 40, sm: 44 },
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: { xs: 36, sm: 40 },
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          }}
        >
          {post.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            mt: "auto",
            pt: { xs: 1.5, sm: 2 },
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
          }}
        >
          <Avatar
            src={post.user?.avatar}
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              bgcolor: "primary.light",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {post.user?.username?.[0]?.toUpperCase() || "?"}
          </Avatar>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              flexGrow: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.user?.username || "Невідомий користувач"}
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{ color: "text.secondary" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Favorite
                fontSize="small"
                sx={{ fontSize: { xs: 16, sm: 18 } }}
              />
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {post.likesCount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Comment fontSize="small" sx={{ fontSize: { xs: 16, sm: 18 } }} />
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {post.commentsCount}
              </Typography>
            </Box>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Visibility
                fontSize="small"
                sx={{ fontSize: { xs: 16, sm: 18 } }}
              />
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {post.views}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;

