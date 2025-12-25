import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Login successful!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Registration successful!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
};

export const useMe = () => {
  const { setAuth, isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setAuth(query.data.user, query.data.token);
    }
  }, [query.data, setAuth]);

  return query;
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      toast.success("Email verified successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Email verification failed");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset successful!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Password reset failed");
    },
  });
};
