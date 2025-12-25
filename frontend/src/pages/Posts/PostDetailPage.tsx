import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  ShoppingCart,
  CheckCircle,
  Phone,
  Telegram,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../features/auth/store/authStore";
import { usePost } from "../../features/posts/hooks/usePosts";
import { useToggleLike } from "../../features/posts/hooks/useLikes";
import { useCheckOrderExists } from "../../features/posts/hooks/useOrders";
import CommentsSection from "../../components/Posts/CommentsSection";
import ReviewsSection from "../../components/Posts/ReviewsSection";
import { CheckoutDialog } from "../../features/posts/components/CheckoutDialog";
import PostDetailSkeleton from "../../shared/components/Skeletons/PostDetailSkeleton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return "/placeholder-image.jpg";
  if (path.startsWith("http")) return path;
  const baseUrl = API_URL.replace("/api", "");
  return `${baseUrl}${path}`;
};

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = usePost(id);
  const likeMutation = useToggleLike();

  const post = data?.data;
  const { data: orderCheck } = useCheckOrderExists(post?._id);
  const hasOrder = orderCheck?.hasOrder || false;
  const existingOrder = orderCheck?.order;

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <Container maxWidth="lg">
        <Typography>Оголошення не знайдено</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            mb: { xs: 2, sm: 3 },
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Назад
        </Button>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={8}>
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
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  mb: { xs: 3, sm: 4 },
                  flexDirection: { xs: "column", sm: "row" },
                  flexWrap: "wrap",
                }}
              >
                {post.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: {
                        xs: "100%",
                        sm:
                          post.images.length === 1 ? "100%" : "calc(50% - 8px)",
                        md:
                          post.images.length === 1
                            ? "100%"
                            : post.images.length === 2
                            ? "calc(50% - 12px)"
                            : "calc(33.333% - 16px)",
                      },
                      maxWidth: "100%",
                      overflow: "hidden",
                      borderRadius: 3,
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                      position: "relative",
                      aspectRatio: "4/3",
                    }}
                  >
                    <Box
                      component="img"
                      src={getImageUrl(image)}
                      alt={`${post.title} ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/placeholder-image.jpg") {
                          target.src = "/placeholder-image.jpg";
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                }}
              >
                {post.title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 0.75, sm: 1 },
                  flexWrap: "wrap",
                  mb: { xs: 2, sm: 3 },
                }}
              >
                <Chip
                  label={post.category}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    textTransform: "capitalize",
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    height: { xs: 28, sm: 32 },
                  }}
                />
                <Chip
                  label={post.condition}
                  sx={{
                    bgcolor: "grey.100",
                    fontWeight: 500,
                    textTransform: "capitalize",
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    height: { xs: 28, sm: 32 },
                  }}
                />
                {post.price && (
                  <Chip
                    label={`$${post.price}`}
                    sx={{
                      bgcolor: "secondary.main",
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      height: { xs: 28, sm: 32 },
                    }}
                  />
                )}
                {post.size && (
                  <Chip
                    label={`Розмір: ${post.size}`}
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      height: { xs: 28, sm: 32 },
                    }}
                  />
                )}
                {post.brand && (
                  <Chip
                    label={post.brand}
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      height: { xs: 28, sm: 32 },
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  lineHeight: 1.7,
                }}
              >
                {post.description}
              </Typography>

              {post.conditionDetails && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, mb: 0.5 }}
                  >
                    Condition Details:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    {post.conditionDetails}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  mt: { xs: 2, sm: 3 },
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isAuthenticated) {
                      likeMutation.mutate(post._id, {
                        onSuccess: () => {
                          queryClient.invalidateQueries({
                            queryKey: ["post", id],
                          });
                        },
                      });
                    }
                  }}
                  disabled={!isAuthenticated || likeMutation.isPending}
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    color: post.isLiked ? "error.main" : "text.secondary",
                    "&:hover": {
                      bgcolor: "error.light",
                    },
                  }}
                >
                  {post.isLiked ? (
                    <Favorite
                      sx={{
                        fontSize: { xs: 20, sm: 24 },
                      }}
                    />
                  ) : (
                    <FavoriteBorder
                      sx={{
                        fontSize: { xs: 20, sm: 24 },
                      }}
                    />
                  )}
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    alignSelf: "center",
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    color: "text.primary",
                    fontWeight: post.isLiked ? 600 : 400,
                  }}
                >
                  {post.likesCount || 0}{" "}
                  {post.likesCount === 1
                    ? "вподобання"
                    : post.likesCount < 5
                    ? "вподобання"
                    : "вподобань"}
                </Typography>
                <IconButton sx={{ p: { xs: 0.75, sm: 1 } }}>
                  <Share sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Box>
            </Paper>

            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <CommentsSection postId={post._id} />
            </Box>
            <ReviewsSection postId={post._id} postOwnerId={post.user._id} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                position: { xs: "static", md: "sticky" },
                top: { md: 20 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2 },
                  mb: { xs: 2, sm: 3 },
                  pb: { xs: 2, sm: 3 },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Avatar
                  src={post.user.avatar}
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: "primary.light",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  {post.user.username[0]}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                  >
                    {post.user.username}
                  </Typography>
                  {post.user.firstName && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                    >
                      {post.user.firstName} {post.user.lastName}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(`/profile/${post.user._id}`)}
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 600,
                  borderRadius: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                View Profile
              </Button>

              {post.price && isAuthenticated && (
                <>
                  {String(user?.id) === String(post.user._id) ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShoppingCart />}
                      disabled
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontWeight: 600,
                        borderRadius: 2,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        borderColor: "grey.400",
                        color: "text.secondary",
                        borderWidth: 2,
                        "&:disabled": {
                          borderWidth: 2,
                          borderColor: "grey.400",
                          color: "text.secondary",
                        },
                      }}
                    >
                      This is your item
                    </Button>
                  ) : hasOrder && existingOrder ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      disabled
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontWeight: 600,
                        borderRadius: 2,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        borderColor: "success.main",
                        color: "success.main",
                        borderWidth: 2,
                        "&:disabled": {
                          borderWidth: 2,
                        },
                      }}
                    >
                      {existingOrder.status === "delivered"
                        ? "Вже придбано"
                        : existingOrder.status === "confirmed"
                        ? "Замовлення підтверджено"
                        : existingOrder.status === "shipped"
                        ? "Замовлення відправлено"
                        : "Замовлення в очікуванні"}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => setCheckoutOpen(true)}
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontWeight: 700,
                        borderRadius: 2,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        bgcolor: "success.main",
                        "&:hover": {
                          bgcolor: "success.dark",
                        },
                      }}
                    >
                      Купити зараз - ${post.price}₴
                    </Button>
                  )}
                </>
              )}
              {isAuthenticated && post.user && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    Зв'язатися з продавцем:
                  </Typography>
                  {post.user.telegram && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        p: 1,
                        bgcolor: "primary.light",
                        borderRadius: 1,
                      }}
                    >
                      <Telegram sx={{ fontSize: 20, color: "white" }} />
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                        color="white"
                      >
                        {post.user.telegram}
                      </Typography>
                    </Box>
                  )}
                  {post.user.phone && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        bgcolor: "primary.light",
                        borderRadius: 1,
                      }}
                    >
                      <Phone sx={{ fontSize: 20, color: "white" }} />
                      <Typography
                        variant="body2"
                        color="white"
                        sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                      >
                        {post.user.phone}
                      </Typography>
                    </Box>
                  )}
                  {!post.user.telegram && !post.user.phone && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                    >
                      Контактна інформація недоступна
                    </Typography>
                  )}
                </Box>
              )}

              {post.location && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Location
                  </Typography>
                  <Typography variant="body2">{post.location}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {post && (
        <CheckoutDialog
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          post={post}
        />
      )}
    </Container>
  );
};

export default PostDetailPage;
