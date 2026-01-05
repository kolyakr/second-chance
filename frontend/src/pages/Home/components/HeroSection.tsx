import { Box, Container, Typography, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logoImage from "../../../uploads/logo.png";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #2e7d32 0%, #4a9f4e 50%, #60ad5e 100%)",
        color: "white",
        py: { xs: 8, sm: 10, md: 14 },
        px: { xs: 2, sm: 0 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          opacity: 0.4,
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            animation: "fadeInUp 0.8s ease-out",
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="Second Chance Logo"
              sx={{
                height: { xs: "120px", sm: "160px", md: "200px", lg: "240px" },
                width: "auto",
                animation: "bounce 2s ease-in-out infinite",
                filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.3))",
                "@keyframes bounce": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}
            />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 900,
                mb: 1,
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.5rem",
                  md: "4.5rem",
                  lg: "5.5rem",
                },
                textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                lineHeight: 1.1,
                background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Second Chance
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              mb: { xs: 4, md: 5 },
              maxWidth: { xs: "100%", md: 700 },
              mx: "auto",
              fontWeight: 300,
              fontSize: {
                xs: "1rem",
                sm: "1.2rem",
                md: "1.4rem",
                lg: "1.6rem",
              },
              opacity: 0.95,
              px: { xs: 2, sm: 0 },
              lineHeight: 1.7,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Відкрийте для себе екологічну моду та дайте речам другий шанс. Приєднуйтеся
            до нашої спільноти еко-свідомих любителів моди, які роблять різницю.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.5, sm: 2 },
              justifyContent: "center",
              flexWrap: "wrap",
              px: { xs: 2, sm: 0 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#2e7d32",
                px: { xs: 4, sm: 5 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: "0px 8px 24px rgba(0,0,0,0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.95)",
                  transform: "translateY(-4px) scale(1.02)",
                  boxShadow: "0px 12px 32px rgba(0,0,0,0.3)",
                },
              }}
              onClick={() => navigate("/posts")}
              endIcon={<ArrowForward />}
            >
              Переглянути товари
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                borderWidth: 2,
                px: { xs: 4, sm: 5 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                fontWeight: 600,
                borderRadius: 3,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "rgba(255,255,255,0.15)",
                  transform: "translateY(-4px)",
                  boxShadow: "0px 8px 24px rgba(255,255,255,0.2)",
                },
              }}
              onClick={() => navigate("/register")}
            >
              Приєднатися до спільноти
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
