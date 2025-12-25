import { useState } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  Notification,
} from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NotificationSkeleton from "../../shared/components/Skeletons/NotificationSkeleton";

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications({ limit: 20 }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Всі сповіщення позначено як прочитані");
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    handleClose();

    if (notification.relatedPost) {
      navigate(`/posts/${notification.relatedPost._id}`);
    } else if (notification.type === "message") {
      navigate("/messages");
    } else if (notification.relatedUser) {
      navigate(`/users/${notification.relatedUser._id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "message":
        return "✉️";
      case "review":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const open = Boolean(anchorEl);
  const unreadCount = data?.unreadCount || 0;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          display: { xs: "none", sm: "flex" },
          p: { xs: 0.5, sm: 1 },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 1.5 }}
      >
        <Box sx={{ width: { xs: 300, sm: 400 }, maxHeight: 500 }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Сповіщення
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Позначити всі прочитаними
              </Button>
            )}
          </Box>
          {isLoading ? (
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {[...Array(5)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </List>
          ) : data?.data && data.data.length > 0 ? (
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {data.data.map((notification, index) => (
                <Box key={notification._id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={notification.relatedUser?.avatar}
                        sx={{ bgcolor: "primary.light" }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={notification.isRead ? 400 : 600}
                        >
                          {notification.content}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < data.data.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Немає сповіщень
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
