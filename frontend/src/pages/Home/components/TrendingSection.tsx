import { Box, Container, Typography, Grid, Button, Paper } from "@mui/material";
import { TrendingUp, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTrendingPosts } from "../../../features/posts/hooks/usePosts";
import PostCard from "../../../components/Posts/PostCard";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import PostCardSkeleton from "../../../shared/components/Skeletons/PostCardSkeleton";

export const TrendingSection = () => {
  const navigate = useNavigate();
  const { data: trendingData, isLoading } = useTrendingPosts(12);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: "background.default",
        py: { xs: 6, sm: 8, md: 10 },
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            mb: { xs: 4, sm: 6 },
            textAlign: "center",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <TrendingUp sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                background: "linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Популярні товари
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "0.9375rem", sm: "1.125rem" },
            }}
          >
            Відкрийте найпопулярніші товари в нашій спільноті зараз
          </Typography>
        </Box>

        {isLoading ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <PostCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {trendingData?.data?.map((post, index) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <Box
                  sx={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                    animation: isVisible
                      ? `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      : "none",
                    "@keyframes fadeInUp": {
                      from: {
                        opacity: 0,
                        transform: "translateY(30px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <PostCard post={post} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && trendingData?.data && trendingData.data.length > 0 && (
          <Box sx={{ textAlign: "center", mt: { xs: 4, sm: 6 } }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/posts")}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: "0px 8px 24px rgba(46, 125, 50, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 32px rgba(46, 125, 50, 0.4)",
                },
              }}
            >
              Переглянути всі товари
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};
