import { Box, Container, Grid, Typography } from "@mui/material";
import { People, ShoppingBag, Autorenew, Favorite } from "@mui/icons-material";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const stats = [
  { label: "Активних користувачів", value: "10K+", icon: People },
  { label: "Оголошень", value: "50K+", icon: ShoppingBag },
  { label: "Збережених товарів", value: "200K+", icon: Autorenew },
  { label: "Задоволених учасників", value: "95%", icon: Favorite },
];

export const StatsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: "background.paper",
        py: { xs: 6, sm: 8 },
        borderBottom: "1px solid",
        borderColor: "divider",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s ease-out",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Box
                  sx={{
                    textAlign: "center",
                    animation: isVisible
                      ? `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      : "none",
                    "@keyframes fadeInUp": {
                      from: {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: { xs: 40, sm: 50 },
                      color: "primary.main",
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "primary.main",
                      mb: 0.5,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
