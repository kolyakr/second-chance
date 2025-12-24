import {
  Container,
  Paper,
  Box,
  Skeleton,
  Grid,
  Typography,
} from "@mui/material";

const ProfileSkeleton = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 3, sm: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
            }}
          >
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              animation="wave"
            />
            <Box sx={{ flexGrow: 1, width: "100%" }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mb: 2 }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="40%"
                height={24}
                sx={{ mb: 1 }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="50%"
                height={20}
                sx={{ mb: 2 }}
                animation="wave"
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={36}
                  animation="wave"
                />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={36}
                  animation="wave"
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          <Skeleton variant="text" width={150} height={32} animation="wave" />
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{
                  borderRadius: 3,
                  height: { xs: 350, sm: 400 },
                }}
                animation="wave"
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfileSkeleton;
