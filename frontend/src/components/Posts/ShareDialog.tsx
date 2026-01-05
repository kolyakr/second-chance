import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Close, ContentCopy, Facebook, Twitter, Telegram } from "@mui/icons-material";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  postTitle: string;
  postId: string;
}

const ShareDialog = ({ open, onClose, postTitle, postId }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/posts/${postId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Посилання скопійовано!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Поділитися товаром</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={shareUrl}
          sx={{ mb: 3 }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={handleCopy} color={copied ? "primary" : "default"}>
                <ContentCopy />
              </IconButton>
            ),
          }}
        />

        <Typography variant="subtitle2" gutterBottom>
          Поділитися через:
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => handleShare("facebook")}
            fullWidth
          >
            Facebook
          </Button>
          <Button
            variant="outlined"
            startIcon={<Twitter />}
            onClick={() => handleShare("twitter")}
            fullWidth
          >
            Twitter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Telegram />}
            onClick={() => handleShare("telegram")}
            fullWidth
          >
            Telegram
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;

