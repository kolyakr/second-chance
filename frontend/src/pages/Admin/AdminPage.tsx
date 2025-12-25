import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  People,
  ShoppingBag,
  Comment,
  TrendingUp,
  Delete,
  Block,
  Search,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/authStore";
import { Navigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPage = () => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: string;
    id: string;
  } | null>(null);
  const queryClient = useQueryClient();

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return <Navigate to="/" replace />;
  }

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminService.getAnalytics,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", userPage, userSearch],
    queryFn: () =>
      adminService.getAllUsers({
        page: userPage,
        limit: 20,
        search: userSearch || undefined,
      }),
  });

  const { data: reportedComments, isLoading: commentsLoading } = useQuery({
    queryKey: ["admin-reported-comments"],
    queryFn: adminService.getReportedComments,
  });

  const deletePostMutation = useMutation({
    mutationFn: adminService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      toast.success("Оголошення успішно видалено");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast.error("Не вдалося видалити оголошення");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: adminService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-comments"] });
      toast.success("Коментар успішно видалено");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast.error("Не вдалося видалити коментар");
    },
  });

  const handleDelete = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "post") {
      deletePostMutation.mutate(itemToDelete.id);
    } else if (itemToDelete.type === "comment") {
      deleteCommentMutation.mutate(itemToDelete.id);
    }
  };

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
              mb: { xs: 2, sm: 3 },
            }}
          >
            Панель адміністратора
          </Typography>

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Аналітика" />
            <Tab label="Користувачі" />
            <Tab label="Скарги на коментарі" />
          </Tabs>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            {analyticsLoading ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Skeleton
                            variant="rectangular"
                            width={40}
                            height={40}
                            animation="wave"
                          />
                          <Box>
                            <Skeleton
                              variant="text"
                              width={80}
                              height={32}
                              animation="wave"
                            />
                            <Skeleton
                              variant="text"
                              width={100}
                              height={20}
                              animation="wave"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : analytics ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <People sx={{ fontSize: 40, color: "primary.main" }} />
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {analytics.data.overview.totalUsers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Всього користувачів
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <ShoppingBag
                          sx={{ fontSize: 40, color: "primary.main" }}
                        />
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {analytics.data.overview.totalPosts}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Всього оголошень
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <TrendingUp
                          sx={{ fontSize: 40, color: "primary.main" }}
                        />
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {analytics.data.overview.activePosts}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Активних оголошень
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Comment sx={{ fontSize: 40, color: "primary.main" }} />
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {analytics.data.overview.totalComments}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Коментарів
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Оголошення за категоріями
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {analytics.data.postsByCategory.map((item) => (
                        <Box
                          key={item._id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {item._id}
                          </Typography>
                          <Chip label={item.count} size="small" />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Останні оголошення
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {analytics.data.recentPosts.slice(0, 5).map((post) => (
                        <Box
                          key={post._id}
                          sx={{
                            mb: 1.5,
                            pb: 1.5,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {post.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {post.user?.username} •{" "}
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            ) : null}
          </TabPanel>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              <TextField
                placeholder="Пошук користувачів..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Box>
            {usersLoading ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Користувач</TableCell>
                      <TableCell>Електронна адреса</TableCell>
                      <TableCell>Роль</TableCell>
                      <TableCell>Дії</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Skeleton
                              variant="circular"
                              width={40}
                              height={40}
                              animation="wave"
                            />
                            <Skeleton
                              variant="text"
                              width={100}
                              height={20}
                              animation="wave"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="text"
                            width={150}
                            height={20}
                            animation="wave"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="rectangular"
                            width={60}
                            height={24}
                            animation="wave"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="rectangular"
                            width={80}
                            height={32}
                            animation="wave"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : usersData ? (
              <>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ім'я користувача</TableCell>
                        <TableCell>Електронна адреса</TableCell>
                        <TableCell>Роль</TableCell>
                        <TableCell>Приєднався</TableCell>
                        <TableCell align="right">Дії</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersData.data.map((userItem) => (
                        <TableRow key={userItem._id}>
                          <TableCell>{userItem.username}</TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={userItem.role}
                              size="small"
                              color={
                                userItem.role === "admin"
                                  ? "error"
                                  : userItem.role === "moderator"
                                  ? "warning"
                                  : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            {userItem.role !== "admin" &&
                              user?.role === "admin" && (
                                <IconButton size="small" color="error">
                                  <Block fontSize="small" />
                                </IconButton>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {usersData.pages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                  >
                    <Pagination
                      count={usersData.pages}
                      page={userPage}
                      onChange={(_, value) => setUserPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            ) : null}
          </TabPanel>

          {/* Reported Comments Tab */}
          <TabPanel value={tabValue} index={2}>
            {commentsLoading ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Користувач</TableCell>
                      <TableCell>Коментар</TableCell>
                      <TableCell>Оголошення</TableCell>
                      <TableCell>Дії</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton
                            variant="text"
                            width={100}
                            height={20}
                            animation="wave"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="text"
                            width="80%"
                            height={20}
                            animation="wave"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="text"
                            width={120}
                            height={20}
                            animation="wave"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="rectangular"
                            width={80}
                            height={32}
                            animation="wave"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : reportedComments && reportedComments.data.length > 0 ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Користувач</TableCell>
                      <TableCell>Коментар</TableCell>
                      <TableCell>Оголошення</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell align="right">Дії</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportedComments.data.map((comment) => (
                      <TableRow key={comment._id}>
                        <TableCell>{comment.user.username}</TableCell>
                        <TableCell>{comment.content}</TableCell>
                        <TableCell>{comment.post.title}</TableCell>
                        <TableCell>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete("comment", comment._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Немає скарг на коментарі
                </Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Підтвердити видалення</DialogTitle>
            <DialogContent>
              <Typography>
                Ви впевнені, що хочете видалити цей {itemToDelete?.type === "post" ? "оголошення" : "коментар"}? Цю дію неможливо скасувати.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
                disabled={
                  deletePostMutation.isPending ||
                  deleteCommentMutation.isPending
                }
              >
                Видалити
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminPage;
