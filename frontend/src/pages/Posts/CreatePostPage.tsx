import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import { AutoAwesome, ImageSearch } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { postService, CreatePostData } from "../../services/postService";
import { uploadService } from "../../services/uploadService";
import { geminiService } from "../../services/geminiService";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  // Remove /api from API_URL if present, then append path
  const baseUrl = API_URL.replace("/api", "");
  return `${baseUrl}${path}`;
};

const validationSchema = Yup.object({
  title: Yup.string().required("Назва обов'язкова").max(100),
  description: Yup.string().required("Опис обов'язковий").max(2000),
  images: Yup.array().min(1, "Потрібно завантажити принаймні одне зображення"),
  category: Yup.string().required("Категорія обов'язкова"),
  condition: Yup.string().required("Стан обов'язковий"),
});

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [analyzingImages, setAnalyzingImages] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      toast.success("Оголошення успішно створено!");
      navigate("/posts");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося створити оголошення");
    },
  });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const response = await uploadService.uploadMultiple(fileArray);
      const urls = response.data.map((img) => img.path);
      setImageUrls((prev) => [...prev, ...urls]);
      formik.setFieldValue("images", [...formik.values.images, ...urls]);
      toast.success("Зображення успішно завантажено");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Не вдалося завантажити зображення");
    } finally {
      setUploading(false);
    }
  };

  const [analysisResults, setAnalysisResults] = useState<{
    category?: string;
    subcategory?: string;
    color?: string;
    brand?: string;
    material?: string;
    condition?: string;
    style?: string;
    suggestedTags?: string[];
  } | null>(null);

  const handleAnalyzeImages = async () => {
    if (formik.values.images.length === 0) {
      toast.error("Please upload images first");
      return;
    }

    setAnalyzingImages(true);
    setAnalysisResults(null);
    try {
      const response = await geminiService.analyzeImages(formik.values.images);
      const data = response.data;

      // Store results for display
      setAnalysisResults(data);

      // Auto-fill form fields
      if (data.category) {
        formik.setFieldValue("category", data.category);
      }
      if (data.subcategory) {
        formik.setFieldValue("subcategory", data.subcategory);
      }
      if (data.color) {
        formik.setFieldValue("color", data.color);
      }
      if (data.brand) {
        formik.setFieldValue("brand", data.brand);
      }
      if (data.material) {
        formik.setFieldValue("material", data.material);
      }
      if (data.condition) {
        formik.setFieldValue("condition", data.condition);
      }
      if (data.suggestedTags && data.suggestedTags.length > 0) {
        formik.setFieldValue("tags", data.suggestedTags);
      }

      toast.success("Аналіз завершено! Перевірте виявлену інформацію нижче.", { duration: 3000 });
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error(
          "AI service is temporarily unavailable. Please try again in a few minutes."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Не вдалося проаналізувати зображення"
        );
      }
    } finally {
      setAnalyzingImages(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (formik.values.images.length === 0) {
      toast.error("Please upload images first");
      return;
    }

    setGeneratingDescription(true);
    try {
      const response = await geminiService.generateDescription({
        imagePaths: formik.values.images,
        category: formik.values.category,
        condition: formik.values.condition,
        brand: formik.values.brand,
        material: formik.values.material,
        color: formik.values.color,
      });

      // Set both title and description
      if (response.data.title) {
        formik.setFieldValue("title", response.data.title);
      }
      if (response.data.description) {
        formik.setFieldValue("description", response.data.description);
      }
      toast.success("Назву та опис успішно згенеровано!");
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error(
          "AI service is temporarily unavailable. Please try again in a few minutes."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Не вдалося згенерувати опис"
        );
      }
    } finally {
      setGeneratingDescription(false);
    }
  };

  const formik = useFormik<CreatePostData>({
    initialValues: {
      title: "",
      description: "",
      images: [],
      category: "men",
      condition: "used",
      subcategory: "",
      size: "",
      brand: "",
      material: "",
      conditionDetails: "",
      price: undefined,
      color: "",
      season: [],
      tags: [],
      location: "",
      isPublic: true,
    },
    validationSchema,
    onSubmit: (values) => {
      createPostMutation.mutate(values);
    },
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "primary.main",
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
              }}
            >
              Створити нове оголошення
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Поділіться своїми речами зі спільнотою
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload"
                    multiple
                    type="file"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      disabled={uploading}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        py: { xs: 1, sm: 1.25 },
                      }}
                    >
                      {uploading ? "Завантаження..." : "Завантажити зображення"}
                    </Button>
                  </label>
                  {formik.values.images.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={
                        analyzingImages ? (
                          <CircularProgress size={16} />
                        ) : (
                          <ImageSearch fontSize="small" />
                        )
                      }
                      onClick={handleAnalyzeImages}
                      disabled={analyzingImages}
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        textTransform: "none",
                      }}
                    >
                      {analyzingImages ? "Аналіз..." : "Аналізувати з AI"}
                    </Button>
                  )}
                </Box>
                {analysisResults && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "primary.light",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Результати аналізу AI:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {analysisResults.category && (
                        <Chip
                          label={`Категорія: ${analysisResults.category}`}
                          size="small"
                          color="primary"
                        />
                      )}
                      {analysisResults.subcategory && (
                        <Chip
                          label={`Тип: ${analysisResults.subcategory}`}
                          size="small"
                        />
                      )}
                      {analysisResults.color && (
                        <Chip
                          label={`Колір: ${analysisResults.color}`}
                          size="small"
                        />
                      )}
                      {analysisResults.brand && (
                        <Chip
                          label={`Бренд: ${analysisResults.brand}`}
                          size="small"
                        />
                      )}
                      {analysisResults.material && (
                        <Chip
                          label={`Матеріал: ${analysisResults.material}`}
                          size="small"
                        />
                      )}
                      {analysisResults.condition && (
                        <Chip
                          label={`Стан: ${analysisResults.condition}`}
                          size="small"
                        />
                      )}
                      {analysisResults.style && (
                        <Chip
                          label={`Стиль: ${analysisResults.style}`}
                          size="small"
                        />
                      )}
                      {analysisResults.suggestedTags &&
                        analysisResults.suggestedTags.length > 0 && (
                          <Chip
                            label={`Теги: ${analysisResults.suggestedTags.join(", ")}`}
                            size="small"
                          />
                        )}
                    </Box>
                    <Button
                      size="small"
                      onClick={() => setAnalysisResults(null)}
                      sx={{ mt: 1 }}
                    >
                      Dismiss
                    </Button>
                  </Box>
                )}
                {imageUrls.length > 0 && (
                  <Box
                    sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {imageUrls.map((url, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={getImageUrl(url)}
                        alt={`Upload ${index + 1}`}
                        sx={{
                          width: { xs: 100, sm: 120 },
                          height: { xs: 100, sm: 120 },
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          cursor: "pointer",
                        }}
                        onError={(e) => {
                          // Fallback to direct URL if helper fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== url) {
                            target.src = url;
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: "block",
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  }}
                >
                  💡 Порада: Спочатку завантажте зображення, потім використайте AI для їх аналізу та
                  автоматичного створення описів!
                </Typography>
              </Box>

              <TextField
                fullWidth
                id="title"
                name="title"
                label="Назва"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                size="small"
              />

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    Опис
                  </Typography>
                  {formik.values.images.length > 0 && (
                    <Button
                      size="small"
                      startIcon={
                        generatingDescription ? (
                          <CircularProgress size={16} />
                        ) : (
                          <AutoAwesome fontSize="small" />
                        )
                      }
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        textTransform: "none",
                      }}
                    >
                      {generatingDescription
                        ? "Генерація..."
                        : "Згенерувати з AI"}
                    </Button>
                  )}
                </Box>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Опис"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    },
                  }}
                  size="small"
                />
              </Box>

              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Категорія
                    </InputLabel>
                    <Select
                      id="category"
                      name="category"
                      value={formik.values.category}
                      label="Категорія"
                      onChange={formik.handleChange}
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      <MenuItem value="men">Чоловіче</MenuItem>
                      <MenuItem value="women">Жіноче</MenuItem>
                      <MenuItem value="children">Дитяче</MenuItem>
                      <MenuItem value="accessories">Аксесуари</MenuItem>
                      <MenuItem value="footwear">Взуття</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Стан
                    </InputLabel>
                    <Select
                      id="condition"
                      name="condition"
                      value={formik.values.condition}
                      label="Стан"
                      onChange={formik.handleChange}
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      <MenuItem value="new">Нове</MenuItem>
                      <MenuItem value="like-new">Як нове</MenuItem>
                      <MenuItem value="used">Вживане</MenuItem>
                      <MenuItem value="with-defects">З дефектами</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="size"
                    name="size"
                    label="Розмір (Необов'язково)"
                    value={formik.values.size}
                    onChange={formik.handleChange}
                    size="small"
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="brand"
                    name="brand"
                    label="Бренд (Необов'язково)"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    size="small"
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                id="price"
                name="price"
                label="Ціна (Необов'язково)"
                type="number"
                value={formik.values.price || ""}
                onChange={formik.handleChange}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                size="small"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={createPostMutation.isPending || uploading}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                  fontWeight: 600,
                  borderRadius: 2,
                  mt: 2,
                }}
              >
                {createPostMutation.isPending ? "Створення..." : "Створити оголошення"}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default CreatePostPage;
