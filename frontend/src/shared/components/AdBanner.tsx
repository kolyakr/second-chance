import { useState, useEffect } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

interface AdBannerProps {
  position?: "left" | "right";
}

export const AdBanner = ({ position = "right" }: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if ad was closed in this session
    const adClosed = sessionStorage.getItem("adBannerClosed");
    if (!adClosed) {
      // Show ad after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    sessionStorage.setItem("adBannerClosed", "true");
  };

  if (isClosed || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        [position]: { xs: 8, sm: 16, md: 24 },
        top: { xs: "50%", sm: "40%" },
        transform: "translateY(-50%)",
        zIndex: 1000,
        width: { xs: 200, sm: 250, md: 300 },
        animation: "slideIn 0.5s ease-out",
        "@keyframes slideIn": {
          from: {
            transform: `translateX(${position === "right" ? "100%" : "-100%"}) translateY(-50%)`,
            opacity: 0,
          },
          to: {
            transform: "translateY(-50%)",
            opacity: 1,
          },
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "2px solid",
          borderColor: "primary.main",
          position: "relative",
        }}
      >
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "grey.200",
            "&:hover": {
              bgcolor: "grey.300",
            },
            width: 24,
            height: 24,
          }}
        >
          <Close fontSize="small" />
        </IconButton>
        <Box
          sx={{
            minHeight: { xs: 150, sm: 200 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.light",
            borderRadius: 1,
            p: 2,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Реклама
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              mt: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            Тут буде ваш рекламний контент
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

