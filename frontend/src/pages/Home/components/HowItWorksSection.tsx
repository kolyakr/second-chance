import { Box, Container, Typography, Grid, Paper, Chip } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const steps = [
  {
    number: "01",
    title: "Реєстрація",
    description: "Створіть безкоштовний обліковий запис менш ніж за хвилину",
  },
  {
    number: "02",
    title: "Переглядайте або створюйте",
    description: "Переглядайте товари або створюйте власні оголошення для інших",
  },
  {
    number: "03",
    title: "Зв'яжіться та обміняйтеся",
    description: "Зв'яжіться з продавцями та домовтеся про отримання або доставку",
  },
  {
    number: "04",
    title: "Насолоджуйтеся",
    description: "Економте гроші та допомагайте навколишньому середовищу одночасно!",
  },
];

export const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: "background.default",
        py: { xs: 6, sm: 8, md: 10 },
        borderTop: "1px solid",
        borderBottom: "1px solid",
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
          <Chip
            label="Простий процес"
            sx={{
              mb: 2,
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              px: 2,
              py: 0.5,
              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              boxShadow: "0px 2px 8px rgba(46, 125, 50, 0.3)",
              "&:hover": {
                bgcolor: "primary.dark",
                boxShadow: "0px 4px 12px rgba(46, 125, 50, 0.4)",
              },
            }}
          />
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
            Як це працює
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
            Почніть всього за чотири прості кроки
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={step.number}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  textAlign: "center",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  height: "100%",
                  position: "relative",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(30px)",
                  animation: isVisible
                    ? `fadeInUp 0.6s ease-out ${index * 0.15}s both`
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
                  transition: "all 0.4s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0px 12px 40px rgba(46, 125, 50, 0.15)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "3rem", sm: "4rem" },
                    fontWeight: 900,
                    color: "primary.light",
                    mb: 2,
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: { xs: "1.125rem", sm: "1.25rem" },
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                    lineHeight: 1.7,
                  }}
                >
                  {step.description}
                </Typography>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      right: -24,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "primary.light",
                    }}
                  >
                    <ArrowForward sx={{ fontSize: 40 }} />
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
