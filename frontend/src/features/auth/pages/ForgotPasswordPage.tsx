import { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useForgotPassword } from "../hooks/useAuth";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: (values: { email: string }) => {
      forgotPasswordMutation.mutate(values.email, {
        onSuccess: () => {
          setSuccess(true);
        },
      });
    },
  });

  if (success) {
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
            <Alert severity="success" sx={{ mb: 2 }}>
              If an account exists with this email, a password reset link has
              been sent.
            </Alert>
            <Typography variant="body2" color="text.secondary" align="center">
              Please check your email and follow the instructions to reset your
              password.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

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
              Forgot Password
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email address and we'll send you a link to reset your
              password
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
