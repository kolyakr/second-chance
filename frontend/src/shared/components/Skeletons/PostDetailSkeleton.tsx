import { Container, Box, Skeleton, Paper, Grid } from "@mui/material";

const PostDetailSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              mb: 3,
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={400}
              animation="wave"
              sx={{
                height: { xs: 300, sm: 400, md: 500 },
              }}
            />
          </Paper>
          <Box sx={{ mb: 3 }}>
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              sx={{ mb: 2 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="100%"
              height={24}
              sx={{ mb: 1 }}
              animation="wave"
            />
            <Skeleton variant="text" width="90%" height={24} animation="wave" />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 20,
            }}
          >
            <Skeleton
              variant="text"
              width="60%"
              height={28}
              sx={{ mb: 2 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              sx={{ mb: 3 }}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={48}
              sx={{ mb: 2 }}
              animation="wave"
            />
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                animation="wave"
              />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={20}
                  sx={{ mb: 0.5 }}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={16}
                  animation="wave"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PostDetailSkeleton;
