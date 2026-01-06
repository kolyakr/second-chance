import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import logoImage from "@/uploads/logo.png";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: { xs: 3, sm: 2 },
          }}
        >
          <Box
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
              maxWidth: { xs: "100%", sm: 300 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1,
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Second Chance Logo"
                sx={{
                  height: { xs: 32, sm: 40 },
                  width: "auto",
                  display: "block",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Second Chance
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                lineHeight: 1.6,
              }}
            >
              Платформа екологічної моди для речей з секонд-хенду. Дайте
              речам другий шанс та допоможіть навколишньому середовищу.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: { xs: "calc(50% - 16px)", sm: "auto" },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Швидкі посилання
            </Typography>
            <MuiLink
              component={Link}
              to="/posts"
              color="text.secondary"
              underline="hover"
              sx={{
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "translateX(4px)",
                },
              }}
            >
              Переглянути товари
            </MuiLink>
            <MuiLink
              component={Link}
              to="/about"
              color="text.secondary"
              underline="hover"
              sx={{
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "translateX(4px)",
                },
              }}
            >
              Про нас
            </MuiLink>
            <MuiLink
              component={Link}
              to="/contact"
              color="text.secondary"
              underline="hover"
              sx={{
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "translateX(4px)",
                },
              }}
            >
              Контакти
            </MuiLink>
          </Box>
          <Box
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              © {new Date().getFullYear()} Second Chance. Всі права захищені.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
