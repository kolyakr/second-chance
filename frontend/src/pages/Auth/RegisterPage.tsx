import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { authService, RegisterData } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
  email: Yup.string().email("Невірна електронна адреса").required("Електронна адреса обов'язкова"),
  password: Yup.string()
    .min(6, "Пароль повинен містити мінімум 6 символів")
    .required("Пароль обов'язковий"),
  username: Yup.string()
    .min(3, "Ім'я користувача повинно містити мінімум 3 символи")
    .max(30, "Ім'я користувача повинно містити менше 30 символів")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Ім'я користувача може містити лише літери, цифри та підкреслення"
    )
    .required("Ім'я користувача обов'язкове"),
  firstName: Yup.string().max(50, "Ім'я повинно містити менше 50 символів"),
  lastName: Yup.string().max(50, "Прізвище повинно містити менше 50 символів"),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role,
          avatar: data.user.avatar,
          isEmailVerified: data.user.isEmailVerified,
        },
        data.token
      );
      toast.success("Реєстрація успішна!");
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Помилка реєстрації");
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      username: "",
      firstName: "",
      lastName: "",
    },
    validationSchema,
    onSubmit: (values: RegisterData) => {
      registerMutation.mutate(values);
    },
  });

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: "0px 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              fontWeight={700}
              sx={{ color: "primary.main" }}
            >
              Приєднатися до Second Chance
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Створіть обліковий запис і почніть ділитися екологічною модою
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Електронна адреса"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
              size="small"
            />

            <TextField
              fullWidth
              id="username"
              name="username"
              label="Ім'я користувача"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
              size="small"
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Пароль"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
              size="small"
            />

            <Box
              sx={{
                display: "flex",
                gap: { xs: 1.5, sm: 2 },
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="Ім'я (Необов'язково)"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                size="small"
              />
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Прізвище (Необов'язково)"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                size="small"
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {registerMutation.isPending ? "Створення облікового запису..." : "Зареєструватися"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Вже є обліковий запис?{" "}
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Увійти
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
