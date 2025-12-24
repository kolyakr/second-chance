import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  ShoppingBag,
} from "@mui/icons-material";
import {
  useMyOrders,
  useSellerOrders,
} from "../../features/posts/hooks/useOrders";
import { useAuthStore } from "../../features/auth/store/authStore";
import { DeliveryProgress } from "../../components/Orders/DeliveryProgress";
import { format } from "date-fns";
import OrderCardSkeleton from "../../shared/components/Skeletons/OrderCardSkeleton";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const { data: myOrdersData, isLoading: myOrdersLoading } = useMyOrders({
    status: statusFilter,
    limit: 50,
  });

  const { data: sellerOrdersData, isLoading: sellerOrdersLoading } =
    useSellerOrders({
      status: statusFilter,
      limit: 50,
    });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setStatusFilter(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Pending />;
      case "confirmed":
        return <CheckCircle />;
      case "shipped":
        return <LocalShipping />;
      case "delivered":
        return <CheckCircle />;
      case "cancelled":
        return <Cancel />;
      default:
        return <ShoppingBag />;
    }
  };

  const orders = tabValue === 0 ? myOrdersData?.data : sellerOrdersData?.data;
  const isLoading = tabValue === 0 ? myOrdersLoading : sellerOrdersLoading;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              mb: 3,
            }}
          >
            Замовлення
          </Typography>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="orders tabs"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    minHeight: { xs: 48, sm: 64 },
                  },
                }}
              >
                <Tab
                  label="Мої покупки"
                  icon={<ShoppingBag />}
                  iconPosition="start"
                />
                <Tab
                  label="Продажі"
                  icon={<LocalShipping />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant={
                    statusFilter === undefined ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setStatusFilter(undefined)}
                >
                  Всі
                </Button>
                <Button
                  variant={
                    statusFilter === "pending" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setStatusFilter("pending")}
                >
                  В очікуванні
                </Button>
                <Button
                  variant={
                    statusFilter === "confirmed" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setStatusFilter("confirmed")}
                >
                  Підтверджено
                </Button>
                <Button
                  variant={
                    statusFilter === "shipped" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setStatusFilter("shipped")}
                >
                  Відправлено
                </Button>
                <Button
                  variant={
                    statusFilter === "delivered" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setStatusFilter("delivered")}
                >
                  Доставлено
                </Button>
              </Box>

              <TabPanel value={tabValue} index={0}>
                {isLoading ? (
                  <Box>
                    {[...Array(3)].map((_, i) => (
                      <OrderCardSkeleton key={i} />
                    ))}
                  </Box>
                ) : !orders || orders.length === 0 ? (
                  <Alert severity="info">
                    Ви ще не зробили жодних покупок.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {orders.map((order) => {
                      const post =
                        typeof order.post === "object" ? order.post : null;
                      const seller =
                        typeof order.seller === "object" ? order.seller : null;
                      return (
                        <Grid item xs={12} key={order._id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2, sm: 3 },
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": {
                                boxShadow: 2,
                              },
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={3}>
                                {post && (post as any).images?.[0] && (
                                  <Box
                                    component="img"
                                    src={(post as any).images[0]}
                                    alt={(post as any).title}
                                    sx={{
                                      width: "100%",
                                      maxWidth: 150,
                                      height: 150,
                                      objectFit: "cover",
                                      borderRadius: 2,
                                    }}
                                  />
                                )}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: "1rem", sm: "1.125rem" },
                                    mb: 1,
                                  }}
                                >
                                  {post ? (post as any).title : "Item"}
                                </Typography>
                                {seller && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Avatar
                                      src={(seller as any).avatar}
                                      sx={{ width: 24, height: 24 }}
                                    >
                                      {(seller as any).username?.[0]}
                                    </Avatar>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {(seller as any).username}
                                    </Typography>
                                  </Box>
                                )}
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Order Date:{" "}
                                  {format(
                                    new Date(order.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                  }}
                                >
                                  ${order.totalAmount}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    icon={getStatusIcon(order.status)}
                                    label={
                                      order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)
                                    }
                                    color={getStatusColor(order.status) as any}
                                    sx={{ fontWeight: 600, minHeight: 32 }}
                                  />
                                  {order.paymentStatus === "paid" && (
                                    <Chip
                                      label="Paid"
                                      color="success"
                                      sx={{ fontWeight: 600, minHeight: 32 }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                              >
                                Адреса доставки:
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                {order.deliveryAddress.fullName}
                                <br />
                                {order.deliveryAddress.address}
                                <br />
                                {order.deliveryAddress.city},{" "}
                                {order.deliveryAddress.state}{" "}
                                {order.deliveryAddress.zipCode}
                                <br />
                                {order.deliveryAddress.country}
                              </Typography>
                              <DeliveryProgress status={order.status} />
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {isLoading ? (
                  <Box>
                    {[...Array(3)].map((_, i) => (
                      <OrderCardSkeleton key={i} />
                    ))}
                  </Box>
                ) : !orders || orders.length === 0 ? (
                  <Alert severity="info">
                    Ви ще не отримали жодних замовлень.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {orders.map((order) => {
                      const post =
                        typeof order.post === "object" ? order.post : null;
                      const buyer =
                        typeof order.buyer === "object" ? order.buyer : null;
                      return (
                        <Grid item xs={12} key={order._id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2, sm: 3 },
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": {
                                boxShadow: 2,
                              },
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={3}>
                                {post && (post as any).images?.[0] && (
                                  <Box
                                    component="img"
                                    src={(post as any).images[0]}
                                    alt={(post as any).title}
                                    sx={{
                                      width: "100%",
                                      maxWidth: 150,
                                      height: 150,
                                      objectFit: "cover",
                                      borderRadius: 2,
                                    }}
                                  />
                                )}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: "1rem", sm: "1.125rem" },
                                    mb: 1,
                                  }}
                                >
                                  {post ? (post as any).title : "Item"}
                                </Typography>
                                {buyer && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Avatar
                                      src={(buyer as any).avatar}
                                      sx={{ width: 24, height: 24 }}
                                    >
                                      {(buyer as any).username?.[0]}
                                    </Avatar>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {(buyer as any).username}
                                    </Typography>
                                  </Box>
                                )}
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Order Date:{" "}
                                  {format(
                                    new Date(order.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                  }}
                                >
                                  ${order.totalAmount}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    icon={getStatusIcon(order.status)}
                                    label={
                                      order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)
                                    }
                                    color={getStatusColor(order.status) as any}
                                    sx={{ fontWeight: 600, minHeight: 32 }}
                                  />
                                  {order.paymentStatus === "paid" && (
                                    <Chip
                                      label="Paid"
                                      color="success"
                                      sx={{ fontWeight: 600, minHeight: 32 }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                              >
                                Адреса доставки:
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                {order.deliveryAddress.fullName}
                                <br />
                                {order.deliveryAddress.address}
                                <br />
                                {order.deliveryAddress.city},{" "}
                                {order.deliveryAddress.state}{" "}
                                {order.deliveryAddress.zipCode}
                                <br />
                                {order.deliveryAddress.country}
                              </Typography>
                              <DeliveryProgress status={order.status} />
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </TabPanel>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default OrdersPage;
