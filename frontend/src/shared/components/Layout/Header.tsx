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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import {
  ShoppingBag,
  Person,
  Dashboard,
  Logout,
  Menu as MenuIcon,
  AddCircle,
  ShoppingCart,
  History,
  Favorite,
} from "@mui/icons-material";
import { useState } from "react";
import NotificationDropdown from "../../../components/Notifications/NotificationDropdown";
import logoImage from "@/uploads/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    setMobileOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const isActiveStart = (path: string) => location.pathname.startsWith(path);

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          component="img"
          src={logoImage}
          alt="Second Chance Logo"
          sx={{
            height: 40,
            width: "auto",
            mr: 0.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Second Chance
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/posts"
            selected={isActiveStart("/posts") && !isActive("/posts/create")}
            onClick={() => setMobileOpen(false)}
            sx={{
              "&.Mui-selected": {
                bgcolor: "primary.light",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "primary.light",
                },
              },
            }}
          >
            <ListItemIcon>
              <ShoppingBag />
            </ListItemIcon>
                <ListItemText primary="Переглянути товари" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/posts/create"
                selected={isActive("/posts/create")}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary="Створити оголошення" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={`/profile/${user?.id}`}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Профіль" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard"
                selected={isActive("/dashboard")}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Панель керування" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/orders"
                selected={isActive("/orders")}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ShoppingCart />
                </ListItemIcon>
                <ListItemText primary="Замовлення" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/wishlist"
                selected={isActive("/wishlist")}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Favorite />
                </ListItemIcon>
                <ListItemText primary="Список бажань" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/view-history"
                selected={isActive("/view-history")}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <History />
                </ListItemIcon>
                <ListItemText primary="Історія перегляду" />
              </ListItemButton>
            </ListItem>
            {user?.role === "admin" && (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/admin"
                  selected={isActiveStart("/admin")}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "primary.light",
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.light",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <ShoppingBag />
                  </ListItemIcon>
                  <ListItemText primary="Панель адміністратора" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Вийти" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/login"
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary="Увійти" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/register"
                onClick={() => setMobileOpen(false)}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  mx: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText primary="Зареєструватися" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            "linear-gradient(135deg, #2e7d32 0%, #4a9f4e 50%, #60ad5e 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0px 4px 30px rgba(46, 125, 50, 0.3)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          animation: "fadeInDown 0.6s ease-out",
          transition: "all 0.3s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
            opacity: 0.5,
            pointerEvents: "none",
            animation: "float 20s ease-in-out infinite",
          },
        }}
      >
        <Toolbar
          sx={{
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1.5, sm: 3 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMobileToggle}
            sx={{
              mr: { xs: 1, sm: 2 },
              display: { md: "none" },
              p: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 800,
              mr: { xs: 1, sm: 2, md: 4 },
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              "&:hover": {
                transform: "translateY(-2px)",
                "& .logo-emoji": {
                  transform: "rotate(15deg) scale(1.1)",
                },
              },
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="Second Chance Logo"
              className="logo-emoji"
              sx={{
                height: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                width: "auto",
                transition: "transform 0.3s ease",
                display: "inline-block",
              }}
            />
            <Box
              component="span"
              sx={{
                display: { xs: "none", sm: "inline" },
                background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Second Chance
            </Box>
          </Typography>

          {/* Desktop Navigation */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              alignItems: "center",
            }}
          >
            <Button
              color="inherit"
              component={Link}
              to="/posts"
              startIcon={<ShoppingBag sx={{ fontSize: 18 }} />}
              sx={{
                fontWeight:
                  isActiveStart("/posts") && !isActive("/posts/create")
                    ? 700
                    : 500,
                fontSize: "0.9375rem",
                px: 2,
                py: 1,
                borderRadius: 2,
                position: "relative",
                transition: "all 0.3s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width:
                    isActiveStart("/posts") && !isActive("/posts/create")
                      ? "60%"
                      : "0%",
                  height: 2,
                  bgcolor: "white",
                  borderRadius: 1,
                  transition: "width 0.3s ease",
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                  transform: "translateY(-2px)",
                  "&::after": {
                    width: "60%",
                  },
                },
              }}
            >
              Переглянути
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/posts/create"
                  startIcon={<AddCircle sx={{ fontSize: 18 }} />}
                  sx={{
                    fontWeight: isActive("/posts/create") ? 700 : 500,
                    fontSize: "0.9375rem",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: isActive("/posts/create") ? "60%" : "0%",
                      height: 2,
                      bgcolor: "white",
                      borderRadius: 1,
                      transition: "width 0.3s ease",
                    },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                      "&::after": {
                        width: "60%",
                      },
                    },
                  }}
                >
                  Створити оголошення
                </Button>
              </>
            )}
          </Box>

          {/* Right Side Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5 },
            }}
          >
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    p: 0.5,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.8)",
                      transform: "scale(1.1) rotate(5deg)",
                      boxShadow: "0px 4px 12px rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      bgcolor: "rgba(255,255,255,0.25)",
                      border: "2px solid white",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 700,
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
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
                      minWidth: 240,
                      mt: 1.5,
                      borderRadius: 3,
                      boxShadow: "0px 16px 40px rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      backdropFilter: "blur(20px)",
                      animation: "fadeInUp 0.25s ease-out",
                      "& .MuiMenuItem-root": {
                        px: 2.25,
                        py: 1.4,
                        transition: "all 0.2s ease",
                        fontSize: "0.9rem",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          color: "text.primary",
                        },
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: "grey.50",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.firstName || user?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <MenuItem
                    component={Link}
                    to={`/profile/${user?.id}`}
                    onClick={handleMenuClose}
                  >
                    <Person
                      sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                    />
                    Профіль
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/dashboard"
                    onClick={handleMenuClose}
                  >
                    <Dashboard
                      sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                    />
                    Панель керування
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/orders"
                    onClick={handleMenuClose}
                  >
                    <ShoppingCart
                      sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                    />
                    Замовлення
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/wishlist"
                    onClick={handleMenuClose}
                  >
                    <Favorite
                      sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                    />
                    Список бажань
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/view-history"
                    onClick={handleMenuClose}
                  >
                    <History
                      sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                    />
                    Історія перегляду
                  </MenuItem>
                  {user?.role === "admin" && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleMenuClose}
                    >
                      <ShoppingBag
                        sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
                      />
                      Панель адміністратора
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      mt: 0.5,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      color: "error.main",
                      fontWeight: 600,
                      "& svg": {
                        color: "error.main",
                      },
                      "&:hover": {
                        bgcolor: "error.light",
                        color: "error.dark",
                      },
                    }}
                  >
                    <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                    Вийти
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
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2.5 },
                    py: { xs: 0.75, sm: 1 },
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Увійти
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: 700,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.75, sm: 1 },
                    borderRadius: 2,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.95)",
                      transform: "translateY(-3px)",
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.25)",
                    },
                  }}
                  component={Link}
                  to="/register"
                >
                  Зареєструватися
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        PaperProps={{
          sx: {
            width: 280,
            boxShadow: "0px 8px 32px rgba(0,0,0,0.15)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
