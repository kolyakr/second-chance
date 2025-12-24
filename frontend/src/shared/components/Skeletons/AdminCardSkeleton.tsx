import { Card, CardContent, Skeleton, Box } from "@mui/material";

const AdminCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton
            variant="rectangular"
            width={40}
            height={40}
            animation="wave"
          />
          <Box>
            <Skeleton variant="text" width={80} height={32} animation="wave" />
            <Skeleton variant="text" width={100} height={20} animation="wave" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminCardSkeleton;
