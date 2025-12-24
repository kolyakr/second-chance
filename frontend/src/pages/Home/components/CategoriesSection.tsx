import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const categories = [
  { name: "Чоловіча мода", color: "#1976d2", value: "men" },
  { name: "Жіноча мода", color: "#d32f2f", value: "women" },
  { name: "Дитяче", color: "#ed6c02", value: "children" },
  { name: "Аксесуари", color: "#9c27b0", value: "accessories" },
  { name: "Взуття", color: "#0288d1", value: "footwear" },
  { name: "Вінтаж", color: "#2e7d32", value: "vintage" },
];

export const CategoriesSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Container
      ref={ref}
      maxWidth="lg"
      sx={{ py: { xs: 6, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}
    >
      <Box
        sx={{
          mb: { xs: 4, sm: 6 },
          textAlign: "center",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            mb: 2,
            background: "linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Покупки за категоріями
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: "auto",
            fontSize: { xs: "0.9375rem", sm: "1.125rem" },
          }}
        >
          Перегляньте тисячі товарів у різних категоріях
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {categories.map((category, index) => (
          <Grid item xs={6} sm={4} md={2} key={category.name}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "background.paper",
                border: "2px solid",
                borderColor: "divider",
                borderRadius: 3,
                cursor: "pointer",
                height: "100%",
                minHeight: { xs: 120, sm: 140 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
                "&:hover": {
                  transform: "translateY(-8px) scale(1.05)",
                  borderColor: category.color,
                  boxShadow: `0px 12px 32px ${category.color}30`,
                },
              }}
              onClick={() => {
                navigate(`/posts?category=${category.value}`);
                // Scroll to top after navigation
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  color: category.color,
                }}
              >
                {category.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
