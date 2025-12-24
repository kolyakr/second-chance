import { Container, Typography, Box, Grid, Card, Chip } from "@mui/material";
import {
  Nature,
  LocalOffer,
  People,
  Speed,
  Security,
  Star,
} from "@mui/icons-material";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const features = [
  {
    icon: Nature,
    title: "Екологічно",
    description:
      "Зменшуйте відходи та сприяйте екологічній моді, даючи речам другий шанс",
    color: "#2e7d32",
  },
  {
    icon: LocalOffer,
    title: "Якісні речі",
    description:
      "Знайдіть речі в чудовому стані за доступними цінами",
    color: "#1976d2",
  },
  {
    icon: People,
    title: "Спільнота",
    description:
      "Спілкуйтеся з однодумцями, які дбають про екологічну моду",
    color: "#d32f2f",
  },
  {
    icon: Speed,
    title: "Швидко та легко",
    description:
      "Створюйте оголошення за хвилини та знаходьте потрібне швидко завдяки нашому розумному пошуку",
    color: "#ed6c02",
  },
  {
    icon: Security,
    title: "Безпечно та надійно",
    description:
      "Надійна платформа з перевіреними користувачами та безпечними способами оплати",
    color: "#9c27b0",
  },
  {
    icon: Star,
    title: "Високий рейтинг",
    description: "Приєднуйтеся до тисяч задоволених користувачів, які люблять нашу платформу",
    color: "#0288d1",
  },
];

export const FeaturesSection = () => {
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
        <Chip
            label="Чому обирають нас"
          sx={{
            mb: 2,
            bgcolor: "primary.light",
            color: "primary.black",
            fontWeight: 600,
            px: 1,
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
          Все, що вам потрібно
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
          Дізнайтеся, чому тисячі користувачів довіряють Second Chance для своїх
          потреб у екологічній моді
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 3, sm: 4 }}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  p: { xs: 3, sm: 4 },
                  textAlign: "center",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
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
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0px 16px 48px rgba(46, 125, 50, 0.2)",
                    borderColor: feature.color,
                    "&::before": {
                      transform: "scaleX(1)",
                    },
                    "& .feature-icon": {
                      transform: "scale(1.1) rotate(5deg)",
                      color: feature.color,
                    },
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    display: "inline-flex",
                    p: 2,
                    borderRadius: "50%",
                    bgcolor: `${feature.color}15`,
                    mb: 2,
                    transition: "all 0.4s ease",
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: { xs: 40, sm: 50 },
                      color: feature.color,
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: { xs: "1.125rem", sm: "1.25rem" },
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};
