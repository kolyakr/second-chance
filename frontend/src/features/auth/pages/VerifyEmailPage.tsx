import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { useVerifyEmail } from "../hooks/useAuth";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [verified, setVerified] = useState(false);
  const verifyMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token, {
        onSuccess: () => {
          setVerified(true);
        },
      });
    }
  }, [token]);

  if (!token) {
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
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="error">
              Invalid verification token
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <CircularProgress size={60} />
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
            textAlign: "center",
          }}
        >
          {verified ? (
            <>
              <Typography variant="h5" color="success.main" gutterBottom>
                ✅ Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been successfully verified. You can now use all
                features of Second Chance.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Go to Home
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" color="error">
                Verification Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                The verification link may have expired or is invalid.
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
