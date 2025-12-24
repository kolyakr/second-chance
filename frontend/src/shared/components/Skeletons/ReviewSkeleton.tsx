import { Box, Skeleton, Paper, Stack } from "@mui/material";

const ReviewSkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Skeleton variant="circular" width={48} height={48} animation="wave" />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton
            variant="text"
            width="40%"
            height={20}
            sx={{ mb: 0.5 }}
            animation="wave"
          />
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={16}
                height={16}
                animation="wave"
              />
            ))}
          </Stack>
        </Box>
      </Box>
      <Skeleton
        variant="text"
        width="100%"
        height={16}
        sx={{ mb: 0.5 }}
        animation="wave"
      />
      <Skeleton variant="text" width="90%" height={16} animation="wave" />
    </Paper>
  );
};

export default ReviewSkeleton;
