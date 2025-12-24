import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Pagination,
  Paper,
  Collapse,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  FilterList,
  AutoAwesome,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { postService } from "../../services/postService";
import { geminiService } from "../../services/geminiService";
import PostCard from "../../components/Posts/PostCard";
import PostCardSkeleton from "../../shared/components/Skeletons/PostCardSkeleton";
import toast from "react-hot-toast";

const PostsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [enhancingSearch, setEnhancingSearch] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    condition: "",
    search: "",
    sortBy: "createdAt",
    order: "desc",
    minPrice: "",
    maxPrice: "",
    color: "",
    season: "",
    size: "",
    brand: "",
  });

  // Handle URL params and scroll to top
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
      setPage(1);
    }
  }, [searchParams]);

  // Scroll to top when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters.category]);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", page, filters],
    queryFn: () => {
      const params: any = {
        ...filters,
        page,
        limit: 12,
      };
      if (params.minPrice) params.minPrice = Number(params.minPrice);
      if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
      // Remove empty strings
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });
      return postService.getPosts(params);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleAISearch = async (query: string) => {
    if (!query.trim()) {
      setFilters((prev) => ({ ...prev, search: "" }));
      return;
    }

    if (!aiSearchMode) {
      // Regular search
      setFilters((prev) => ({ ...prev, search: query }));
      return;
    }

    // AI-enhanced search
    setEnhancingSearch(true);
    try {
      const response = await geminiService.enhanceSearch(query);
      const enhancedFilters = response.data;

      // Update filters with AI suggestions
      const newFilters: any = { ...filters };
      
      let hasStructuredFilters = false;

      // Set category if detected
      if (enhancedFilters.category) {
        newFilters.category = enhancedFilters.category;
        hasStructuredFilters = true;
      }
      
      // Set condition if detected
      if (enhancedFilters.condition && enhancedFilters.condition.length > 0) {
        newFilters.condition = enhancedFilters.condition[0]; // Take first condition
        hasStructuredFilters = true;
      }
      
      // Set color if detected
      if (enhancedFilters.color) {
        newFilters.color = enhancedFilters.color;
        hasStructuredFilters = true;
      }
      
      // Set season if detected
      if (enhancedFilters.season && enhancedFilters.season.length > 0) {
        newFilters.season = enhancedFilters.season[0]; // Take first season
        hasStructuredFilters = true;
      }
      
      // Set material if detected
      if (enhancedFilters.material) {
        newFilters.material = enhancedFilters.material;
        hasStructuredFilters = true;
      }
      
      // If AI detected structured filters (category, season, condition, etc.),
      // clear the search field to let filters work properly
      // Otherwise, use searchTerms for text search
      if (hasStructuredFilters) {
        // Clear search field - filters will handle the search
        newFilters.search = "";
      } else {
        // No structured filters, use searchTerms for text search
        const searchParts: string[] = [];
        
        // Use AI searchTerms if available (they already include original query + English equivalents)
        // Otherwise, use original query
        if (enhancedFilters.searchTerms && enhancedFilters.searchTerms.trim()) {
          searchParts.push(enhancedFilters.searchTerms.trim());
        } else if (query.trim()) {
          searchParts.push(query.trim());
        }
        
        // Add tags if available
        if (enhancedFilters.tags && enhancedFilters.tags.length > 0) {
          searchParts.push(...enhancedFilters.tags);
        }
        
        // Combine all search terms
        newFilters.search = searchParts.join(" ").trim();
        
        // If no search terms, keep original query
        if (!newFilters.search && query.trim()) {
          newFilters.search = query.trim();
        }
      }

      setFilters(newFilters);
      setPage(1);
      toast.success("Пошук покращено за допомогою AI!");
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error(
          "AI пошук тимчасово недоступний. Використовується звичайний пошук."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Не вдалося покращити пошук"
        );
      }
      // Fallback to regular search
      setFilters((prev) => ({ ...prev, search: query }));
    } finally {
      setEnhancingSearch(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      condition: "",
      search: "",
      sortBy: "createdAt",
      order: "desc",
      minPrice: "",
      maxPrice: "",
      color: "",
      season: "",
      size: "",
      brand: "",
    });
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== "createdAt" && v !== "desc"
  ).length;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            }}
          >
            Переглянути товари
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Відкрийте для себе чудові речі з секонд-хенду від нашої спільноти
          </Typography>

          <Paper
            elevation={0}
            sx={{
              mb: { xs: 3, sm: 4 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: "flex",
                gap: { xs: 1.5, sm: 2 },
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexGrow: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  placeholder={
                    aiSearchMode
                      ? "Спробуйте: 'тепла зимова куртка' або 'елегантна сукня для весілля'..."
                      : "Пошук..."
                  }
                  value={filters.search}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange("search", value);
                    // If AI mode is on and user is typing, we'll search on Enter or when they stop typing
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && filters.search) {
                      if (aiSearchMode) {
                        handleAISearch(filters.search);
                      } else {
                        // Regular search on Enter
                        handleFilterChange("search", filters.search);
                      }
                    }
                  }}
                  disabled={enhancingSearch}
                  sx={{
                    flexGrow: 1,
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    },
                  }}
                  size="small"
                />
                <Button
                  size="small"
                  variant={aiSearchMode ? "contained" : "outlined"}
                  startIcon={
                    enhancingSearch ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AutoAwesome fontSize="small" />
                    )
                  }
                  onClick={() => {
                    setAiSearchMode(!aiSearchMode);
                    if (!aiSearchMode && filters.search) {
                      handleAISearch(filters.search);
                    }
                  }}
                  disabled={enhancingSearch}
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "none",
                    minWidth: { xs: 60, sm: 80 },
                    whiteSpace: "nowrap",
                  }}
                >
                  AI
                </Button>
              </Box>
              <FormControl
                sx={{
                  minWidth: { xs: "calc(50% - 8px)", sm: 150 },
                  flexGrow: { xs: 1, sm: 0 },
                }}
                size="small"
              >
                <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Категорія
                </InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <MenuItem value="">Всі</MenuItem>
                  <MenuItem value="men">Чоловіче</MenuItem>
                  <MenuItem value="women">Жіноче</MenuItem>
                  <MenuItem value="children">Дитяче</MenuItem>
                  <MenuItem value="accessories">Аксесуари</MenuItem>
                  <MenuItem value="footwear">Взуття</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                sx={{
                  minWidth: { xs: "calc(50% - 8px)", sm: 150 },
                  flexGrow: { xs: 1, sm: 0 },
                }}
                size="small"
              >
                <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Стан
                </InputLabel>
                <Select
                  value={filters.condition}
                  label="Condition"
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <MenuItem value="">Всі</MenuItem>
                  <MenuItem value="new">Нове</MenuItem>
                  <MenuItem value="like-new">Як нове</MenuItem>
                  <MenuItem value="used">Вживане</MenuItem>
                  <MenuItem value="with-defects">З дефектами</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  flexGrow: { xs: 1, sm: 0 },
                }}
                size="small"
              >
                <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Сортувати за
                </InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <MenuItem value="createdAt">Найновіші</MenuItem>
                  <MenuItem value="popularity">Популярні</MenuItem>
                  <MenuItem value="likesCount">Найбільше вподобань</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                endIcon={showAdvancedFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Більше фільтрів
                {activeFiltersCount > 0 && (
                  <Chip
                    label={activeFiltersCount}
                    size="small"
                    sx={{ ml: 1, height: 20, minWidth: 20 }}
                  />
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="text"
                  onClick={clearFilters}
                  size="small"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  Clear All
                </Button>
              )}
            </Box>

            <Collapse in={showAdvancedFilters}>
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Мін. ціна"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  size="small"
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <TextField
                  label="Макс. ціна"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  size="small"
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <FormControl
                  size="small"
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                >
                  <InputLabel>Колір</InputLabel>
                  <Select
                    value={filters.color}
                    label="Колір"
                    onChange={(e) =>
                      handleFilterChange("color", e.target.value)
                    }
                  >
                    <MenuItem value="">Всі</MenuItem>
                    <MenuItem value="black">Чорний</MenuItem>
                    <MenuItem value="white">Білий</MenuItem>
                    <MenuItem value="red">Червоний</MenuItem>
                    <MenuItem value="blue">Синій</MenuItem>
                    <MenuItem value="green">Зелений</MenuItem>
                    <MenuItem value="yellow">Жовтий</MenuItem>
                    <MenuItem value="pink">Рожевий</MenuItem>
                    <MenuItem value="purple">Фіолетовий</MenuItem>
                    <MenuItem value="orange">Помаранчевий</MenuItem>
                    <MenuItem value="brown">Коричневий</MenuItem>
                    <MenuItem value="gray">Сірий</MenuItem>
                    <MenuItem value="multicolor">Багатоколірний</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                >
                  <InputLabel>Сезон</InputLabel>
                  <Select
                    value={filters.season}
                    label="Сезон"
                    onChange={(e) =>
                      handleFilterChange("season", e.target.value)
                    }
                  >
                    <MenuItem value="">Всі</MenuItem>
                    <MenuItem value="spring">Весна</MenuItem>
                    <MenuItem value="summer">Літо</MenuItem>
                    <MenuItem value="fall">Осінь</MenuItem>
                    <MenuItem value="winter">Зима</MenuItem>
                    <MenuItem value="all-season">Універсальний</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Розмір"
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                  size="small"
                  placeholder="XS, S, M, L, XL..."
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                />
                <TextField
                  label="Бренд"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                  size="small"
                  placeholder="Nike, Adidas..."
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 120 } }}
                />
              </Box>
            </Collapse>
          </Paper>

          {isLoading ? (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <PostCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : !data?.data || data.data.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 6, sm: 8 },
                textAlign: "center",
              }}
            >
              <Alert
                severity="info"
                sx={{
                  width: "100%",
                  maxWidth: 600,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {activeFiltersCount > 0
                  ? "Товарів за вашими фільтрами не знайдено. Спробуйте змінити критерії пошуку."
                  : "Наразі товарів немає. Перевірте пізніше!"}
              </Alert>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ mt: 3 }}
                >
                  Очистити всі фільтри
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {data?.data?.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
              </Grid>
              {data && data.pages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: { xs: 4, sm: 6 },
                    mb: { xs: 3, sm: 4 },
                  }}
                >
                  <Pagination
                    count={data.pages}
                    page={page}
                    onChange={(_, value) => {
                      setPage(value);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    color="primary"
                    size="large"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PostsPage;
