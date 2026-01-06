import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { AdBanner } from "../AdBanner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 0, sm: 1, md: 3 },
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
      <Footer />
      <AdBanner position="right" />
    </Box>
  );
};

export default Layout;
