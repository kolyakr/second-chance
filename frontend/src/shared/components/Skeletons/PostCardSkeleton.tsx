import { Card, CardContent, Skeleton, Box, Stack } from "@mui/material";

const PostCardSkeleton = () => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Skeleton
        variant="rectangular"
        height={280}
        animation="wave"
        sx={{
          height: { xs: 240, sm: 260, md: 280 },
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Skeleton
          variant="text"
          width="90%"
          height={28}
          sx={{ mb: 1 }}
          animation="wave"
        />
        <Skeleton
          variant="text"
          width="100%"
          height={20}
          sx={{ mb: 0.5 }}
          animation="wave"
        />
        <Skeleton
          variant="text"
          width="80%"
          height={20}
          sx={{ mb: 2 }}
          animation="wave"
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            mt: "auto",
            pt: { xs: 1.5, sm: 2 },
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            animation="wave"
          />
          <Skeleton
            variant="text"
            width={100}
            height={20}
            sx={{ flexGrow: 1 }}
            animation="wave"
          />
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="text" width={30} height={20} animation="wave" />
            <Skeleton variant="text" width={30} height={20} animation="wave" />
            <Skeleton
              variant="text"
              width={30}
              height={20}
              sx={{ display: { xs: "none", sm: "block" } }}
              animation="wave"
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCardSkeleton;
