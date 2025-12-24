import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import PostCard from "../../components/Posts/PostCard";
import PostCardSkeleton from "../../shared/components/Skeletons/PostCardSkeleton";

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: userService.getDashboard,
  });

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ py: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                mb: { xs: 2, sm: 3 },
              }}
            >
              Панель керування
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    mb: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Grid container spacing={{ xs: 2, sm: 2 }}>
                    {[...Array(2)].map((_, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <PostCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <PostCardSkeleton />
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              mb: { xs: 2, sm: 3 },
            }}
          >
            Dashboard
          </Typography>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1.125rem", sm: "1.25rem" },
                    mb: { xs: 2, sm: 2.5 },
                  }}
                >
                  Ваші останні оголошення
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  {data?.data?.recentPosts?.map((post: any) => (
                    <Grid item xs={12} sm={6} key={post._id}>
                      <PostCard post={post} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1.125rem", sm: "1.25rem" },
                    mb: { xs: 2, sm: 2.5 },
                  }}
                >
                  Збережені оголошення
                </Typography>
                {data?.data?.savedPosts?.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: { xs: 1.5, sm: 2 },
                    }}
                  >
                    {data.data.savedPosts.slice(0, 5).map((post: any) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                  >
                    Поки що немає збережених оголошень
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;
