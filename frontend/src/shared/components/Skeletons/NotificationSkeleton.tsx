import {
  Box,
  Skeleton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

const NotificationSkeleton = () => {
  return (
    <ListItem>
      <ListItemAvatar>
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Skeleton variant="text" width="70%" height={20} animation="wave" />
        }
        secondary={
          <Skeleton variant="text" width="50%" height={16} animation="wave" />
        }
      />
    </ListItem>
  );
};

export default NotificationSkeleton;
