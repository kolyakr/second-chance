import { Box } from "@mui/material";
import { HeroSection } from "./Home/components/HeroSection";
import { StatsSection } from "./Home/components/StatsSection";
import { FeaturesSection } from "./Home/components/FeaturesSection";
import { HowItWorksSection } from "./Home/components/HowItWorksSection";
import { CategoriesSection } from "./Home/components/CategoriesSection";
import { TrendingSection } from "./Home/components/TrendingSection";

const HomePage = () => {
  return (
    <Box>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TrendingSection />
    </Box>
  );
};

export default HomePage;
