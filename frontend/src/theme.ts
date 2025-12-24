import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // Green - eco-friendly theme
      light: "#60ad5e",
      dark: "#005005",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#6c757d",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "3rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 8px 16px rgba(0,0,0,0.1)",
    "0px 12px 24px rgba(0,0,0,0.12)",
    "0px 16px 32px rgba(0,0,0,0.14)",
    "0px 20px 40px rgba(0,0,0,0.16)",
    "0px 24px 48px rgba(0,0,0,0.18)",
    "0px 28px 56px rgba(0,0,0,0.2)",
    "0px 32px 64px rgba(0,0,0,0.22)",
    "0px 36px 72px rgba(0,0,0,0.24)",
    "0px 40px 80px rgba(0,0,0,0.26)",
    "0px 44px 88px rgba(0,0,0,0.28)",
    "0px 48px 96px rgba(0,0,0,0.3)",
    "0px 52px 104px rgba(0,0,0,0.32)",
    "0px 56px 112px rgba(0,0,0,0.34)",
    "0px 60px 120px rgba(0,0,0,0.36)",
    "0px 64px 128px rgba(0,0,0,0.38)",
    "0px 68px 136px rgba(0,0,0,0.4)",
    "0px 72px 144px rgba(0,0,0,0.42)",
    "0px 76px 152px rgba(0,0,0,0.44)",
    "0px 80px 160px rgba(0,0,0,0.46)",
    "0px 84px 168px rgba(0,0,0,0.48)",
    "0px 88px 176px rgba(0,0,0,0.5)",
    "0px 92px 184px rgba(0,0,0,0.52)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          padding: "10px 24px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 6px 16px rgba(46, 125, 50, 0.4)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0px 8px 30px rgba(0,0,0,0.12)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        },
        elevation3: {
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&:hover fieldset": {
              borderColor: "#2e7d32",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2e7d32",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
