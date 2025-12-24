import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { useAuthStore } from "../../features/auth/store/authStore";
import PostCard from "../../components/Posts/PostCard";
import { EditProfileDialog } from "./EditProfileDialog";
import toast from "react-hot-toast";
import ProfileSkeleton from "../../shared/components/Skeletons/ProfileSkeleton";
import PostCardSkeleton from "../../shared/components/Skeletons/PostCardSkeleton";

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => userService.getUserProfile(id!),
    enabled: !!id,
  });

  const { data: postsData } = useQuery({
    queryKey: ["user-posts", id],
    queryFn: () => postService.getUserPosts(id!),
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: userService.toggleFollow,
    onSuccess: async (data) => {
      // Immediately update the cache
      queryClient.setQueryData(["user-profile", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isFollowing: data.following,
          },
        };
      });
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["user-profile", id] });
      await queryClient.refetchQueries({ queryKey: ["user-profile", id] });
      toast.success(data.following ? "Тепер ви підписані" : "Відписка виконана");
    },
    onError: () => {
      toast.error("Не вдалося оновити статус підписки");
    },
  });

  const user = profileData?.data;

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Typography>Користувача не знайдено</Typography>
      </Container>
    );
  }

  const isOwnProfile =
    currentUser && String(currentUser.id) === String(user._id);
  const isFollowing = user.isFollowing === true;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              mb: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, sm: 3 },
                flexWrap: "wrap",
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Avatar
                src={user.avatar}
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  bgcolor: "primary.light",
                  border: { xs: "3px solid", sm: "4px solid" },
                  borderColor: "primary.main",
                }}
              >
                {user.username[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "200px" } }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    mb: { xs: 0.5, sm: 1 },
                  }}
                >
                  {user.username}
                </Typography>
                {user.firstName && (
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                  >
                    {user.firstName} {user.lastName}
                  </Typography>
                )}
                {user.bio && (
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {user.bio}
                  </Typography>
                )}
                {user.location && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    📍 {user.location}
                  </Typography>
                )}
                {user.stats && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 2, sm: 3 },
                      mt: { xs: 1.5, sm: 2 },
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                      >
                        {user.stats.postsCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Оголошень
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                      >
                        {user.stats.followersCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Підписників
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                      >
                        {user.stats.followingCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Підписок
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              {!isOwnProfile && currentUser && (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={() => followMutation.mutate(user._id)}
                  disabled={followMutation.isPending}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                    ...(isFollowing
                      ? {
                          borderColor: "grey.400",
                          color: "grey.700",
                          bgcolor: "grey.100",
                          "&:hover": {
                            bgcolor: "grey.200",
                            borderColor: "grey.500",
                          },
                        }
                      : {}),
                  }}
                >
                  {followMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : isFollowing ? (
                    "Підписано"
                  ) : (
                    "Підписатися"
                  )}
                </Button>
              )}
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  onClick={() => setEditDialogOpen(true)}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
                >
                  Редагувати профіль
                </Button>
              )}
            </Box>
          </Paper>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Оголошення ({postsData?.count || 0})
          </Typography>
          <Grid container spacing={3}>
            {!postsData ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <PostCardSkeleton />
                  </Grid>
                ))}
              </>
            ) : (
              postsData.data?.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
                  <PostCard post={post} />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>

      {user && (
        <EditProfileDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          user={user}
        />
      )}
    </Box>
  );
};

export default ProfilePage;
