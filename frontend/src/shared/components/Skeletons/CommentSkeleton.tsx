import { Box, Skeleton, Paper } from "@mui/material";

const CommentSkeleton = () => {
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
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={20}
            sx={{ mb: 1 }}
            animation="wave"
          />
          <Skeleton
            variant="text"
            width="100%"
            height={16}
            sx={{ mb: 0.5 }}
            animation="wave"
          />
          <Skeleton variant="text" width="80%" height={16} animation="wave" />
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentSkeleton;
