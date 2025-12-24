import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

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
          <Box sx={{ minWidth: { xs: "100%", sm: "auto" }, maxWidth: { xs: "100%", sm: 300 } }}>
            <Typography
              variant="h5"
              sx={{ 
                mb: 1, 
                fontWeight: 700, 
                color: "primary.main",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              🌱 Second Chance
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                lineHeight: 1.6,
              }}
            >
              Sustainable fashion platform for second-hand clothing. Give
              clothes a second life and help the environment.
            </Typography>
          </Box>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: 1,
            minWidth: { xs: "calc(50% - 16px)", sm: "auto" },
          }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Quick Links
            </Typography>
            <MuiLink
              component={Link}
              to="/posts"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              Browse Items
            </MuiLink>
            <MuiLink
              component={Link}
              to="/about"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              About Us
            </MuiLink>
            <MuiLink
              component={Link}
              to="/contact"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              Contact
            </MuiLink>
          </Box>
          <Box sx={{ minWidth: { xs: "100%", sm: "auto" }, textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              © {new Date().getFullYear()} Second Chance. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
