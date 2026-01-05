import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { ShoppingBag, Person, Dashboard, Logout, Favorite, History } from "@mui/icons-material";
import { useState } from "react";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import logoImage from "../../uploads/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
            mr: { xs: 1, sm: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          <Box
            component="img"
            src={logoImage}
            alt="Second Chance Logo"
            sx={{
              height: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
              width: "auto",
              mr: 0.5,
            }}
          />
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Second Chance
          </Box>
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/posts"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Browse
          </Button>
          {isAuthenticated && (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/posts/create"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Post Item
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/messages"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Messages
              </Button>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  border: "2px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    bgcolor: "rgba(255,255,255,0.2)",
                    border: "2px solid white",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                  src={user?.avatar}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    minWidth: { xs: 150, sm: 200 },
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to={`/profile/${user?.id}`}
                  onClick={handleMenuClose}
                >
                  <Person sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />{" "}
                  Profile
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/dashboard"
                  onClick={handleMenuClose}
                >
                  <Dashboard sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />{" "}
                  Dashboard
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/wishlist"
                  onClick={handleMenuClose}
                >
                  <Favorite sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />{" "}
                  Список бажань
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/view-history"
                  onClick={handleMenuClose}
                >
                  <History sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />{" "}
                  Історія перегляду
                </MenuItem>
                {user?.role === "admin" && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleMenuClose}
                  >
                    <ShoppingBag sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />{" "}
                    Admin
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                sx={{
                  ml: { xs: 0.5, sm: 1 },
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2 },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                  },
                }}
                component={Link}
                to="/register"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
