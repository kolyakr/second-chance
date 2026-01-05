import { Container, Typography, Box, Grid, Alert } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { wishlistService } from "../../services/wishlistService";
import PostCard from "../../components/Posts/PostCard";
import PostCardSkeleton from "../../shared/components/Skeletons/PostCardSkeleton";
import { useAuthStore } from "../../features/auth/store/authStore";
import { Navigate } from "react-router-dom";

const WishlistPage = () => {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getWishlist(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const wishlistItems = data?.data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Список бажань
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Товари, які ви зберегли для майбутнього
      </Typography>

      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <PostCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : wishlistItems.length === 0 ? (
        <Alert severity="info">Ваш список бажань порожній</Alert>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <PostCard post={item.post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;

