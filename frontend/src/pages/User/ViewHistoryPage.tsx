import { Container, Typography, Box, Grid, Alert, Button } from "@mui/material";
import { Clear } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { viewHistoryService } from "../../services/viewHistoryService";
import PostCard from "../../components/Posts/PostCard";
import PostCardSkeleton from "../../shared/components/Skeletons/PostCardSkeleton";
import { useAuthStore } from "../../features/auth/store/authStore";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const ViewHistoryPage = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["view-history"],
    queryFn: () => viewHistoryService.getViewHistory(20),
    enabled: isAuthenticated,
  });

  const clearMutation = useMutation({
    mutationFn: viewHistoryService.clearViewHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["view-history"] });
      toast.success("Історія перегляду очищена");
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const historyItems = data?.data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Нещодавно переглянуті
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Товари, які ви нещодавно переглядали
          </Typography>
        </Box>
        {historyItems.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            Очистити
          </Button>
        )}
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <PostCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : historyItems.length === 0 ? (
        <Alert severity="info">Історія перегляду порожня</Alert>
      ) : (
        <Grid container spacing={3}>
          {historyItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <PostCard post={item.post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ViewHistoryPage;

