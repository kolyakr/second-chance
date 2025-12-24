import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { useAuthStore } from "../../features/auth/store/authStore";
import {
  usePostComments,
  useCreateComment,
  useDeleteComment,
} from "../../features/posts/hooks/useComments";
import { Send, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import CommentSkeleton from "../../shared/components/Skeletons/CommentSkeleton";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [comment, setComment] = useState("");

  const { data, isLoading } = usePostComments(postId);
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    createCommentMutation.mutate(
      { postId, content: comment },
      {
        onSuccess: () => {
          setComment("");
        },
      }
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
        }}
      >
        Коментарі ({data?.count || 0})
      </Typography>

      {isAuthenticated && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mb: { xs: 3, sm: 4 },
            p: { xs: 1.5, sm: 2 },
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Напишіть коментар..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiInputBase-root": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
            }}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<Send sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              py: { xs: 1, sm: 1.25 },
            }}
          >
            Опублікувати коментар
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          {data?.data?.map((comment) => (
            <Box
              key={comment._id}
              sx={{
                display: "flex",
                gap: { xs: 1.5, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "primary.light",
                },
              }}
            >
              <Avatar
                src={comment.user.avatar}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  bgcolor: "primary.light",
                }}
              >
                {comment.user.username[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      color: "text.primary",
                    }}
                  >
                    {comment.user.username}
                  </Typography>
                  {user?.id === comment.user._id && (
                    <IconButton
                      size="small"
                      onClick={() => deleteCommentMutation.mutate(comment._id)}
                      sx={{
                        p: 0.5,
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                    lineHeight: 1.6,
                    color: "text.primary",
                    mb: 0.5,
                    wordBreak: "break-word",
                  }}
                >
                  {comment.content}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
          {data?.count === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ py: 4 }}
            >
              Поки що немає коментарів. Будьте першим!
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CommentsSection;
