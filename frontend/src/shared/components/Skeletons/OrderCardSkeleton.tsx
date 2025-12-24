import { Card, CardContent, Skeleton, Box, Stack } from "@mui/material";

const OrderCardSkeleton = () => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        mb: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={120}
            height={120}
            sx={{ borderRadius: 2 }}
            animation="wave"
          />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton
              variant="text"
              width="70%"
              height={28}
              sx={{ mb: 1 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="50%"
              height={20}
              sx={{ mb: 1 }}
              animation="wave"
            />
            <Skeleton variant="text" width="40%" height={20} animation="wave" />
          </Box>
        </Box>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={8}
          sx={{ borderRadius: 1, mb: 2 }}
          animation="wave"
        />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Skeleton variant="text" width={100} height={20} animation="wave" />
          <Skeleton
            variant="rectangular"
            width={80}
            height={32}
            animation="wave"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCardSkeleton;
