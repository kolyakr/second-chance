import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { uploadService } from "../../services/uploadService";
import { useAuthStore } from "../../features/auth/store/authStore";
import toast from "react-hot-toast";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    avatar?: string;
  };
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .max(50, "Ім'я повинно містити менше 50 символів")
    .nullable(),
  lastName: Yup.string()
    .max(50, "Прізвище повинно містити менше 50 символів")
    .nullable(),
  bio: Yup.string().max(500, "Біографія повинна містити менше 500 символів").nullable(),
  location: Yup.string()
    .max(100, "Місцезнаходження повинно містити менше 100 символів")
    .nullable(),
});

export const EditProfileDialog = ({
  open,
  onClose,
  user,
}: EditProfileDialogProps) => {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Update auth store with new user data
      updateUser({
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        avatar: data.data.avatar,
      });
      toast.success("Профіль успішно оновлено!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося оновити профіль");
    },
  });

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      location: user.location || "",
      avatar: user.avatar || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const updateData: any = {};
      if (values.firstName) updateData.firstName = values.firstName;
      if (values.lastName) updateData.lastName = values.lastName;
      if (values.bio !== undefined) updateData.bio = values.bio;
      if (values.location) updateData.location = values.location;
      if (values.avatar) updateData.avatar = values.avatar;

      updateProfileMutation.mutate(updateData);
    },
  });

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Будь ласка, виберіть файл зображення");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Розмір зображення повинен бути менше 5 МБ");
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await uploadService.uploadSingle(file);
      formik.setFieldValue("avatar", response.data.path);
      toast.success("Аватар успішно завантажено!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Не вдалося завантажити аватар");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Редагувати профіль
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar
              src={formik.values.avatar || user.avatar}
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.light",
                fontSize: "3rem",
                border: "4px solid",
                borderColor: "primary.main",
              }}
            >
              {user.username[0]?.toUpperCase()}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                disabled={uploadingAvatar}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {uploadingAvatar ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PhotoCamera />
                )}
              </IconButton>
            </label>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Натисніть на іконку камери, щоб завантажити новий аватар
          </Typography>
        </Box>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="Ім'я"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Прізвище"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Біографія"
            name="bio"
            value={formik.values.bio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={
              formik.touched.bio
                ? formik.errors.bio
                : `${formik.values.bio.length}/500 символів`
            }
            margin="normal"
            multiline
            rows={4}
            size="small"
          />
          <TextField
            fullWidth
            label="Місцезнаходження"
            name="location"
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            margin="normal"
            size="small"
            placeholder="Місто, Країна"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={updateProfileMutation.isPending}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={updateProfileMutation.isPending || uploadingAvatar}
          sx={{
            px: 4,
            fontWeight: 600,
          }}
        >
          {updateProfileMutation.isPending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Збереження...
            </>
          ) : (
            "Зберегти зміни"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
