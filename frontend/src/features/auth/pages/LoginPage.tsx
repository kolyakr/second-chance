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
import { useLogin } from "../hooks/useAuth";

const validationSchema = Yup.object({
  email: Yup.string().email("Невірна електронна адреса").required("Електронна адреса обов'язкова"),
  password: Yup.string().required("Пароль обов'язковий"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      loginMutation.mutate(values, {
        onSuccess: () => {
          navigate("/");
        },
      });
    },
  });

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 0 },
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: "0px 8px 40px rgba(0,0,0,0.12)",
            animation: "scaleIn 0.5s ease-out",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0px 12px 48px rgba(46, 125, 50, 0.15)",
            },
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
              Ласкаво просимо
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Увійдіть, щоб продовжити роботу з Second Chance
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Ласкаво просимо назад до Second Chance
          </Typography>

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
                mb: 3,
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
              disabled={loginMutation.isPending}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loginMutation.isPending ? "Вхід..." : "Увійти"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  Забули пароль?
                </Typography>
              </Link>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Немає облікового запису?{" "}
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Зареєструватися
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

export default LoginPage;
