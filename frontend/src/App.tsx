import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shared/components/Layout/Layout";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";

// Auth pages
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";

// Posts pages - TODO: Move to features/posts/pages
import PostsPage from "./pages/Posts/PostsPage";
import PostDetailPage from "./pages/Posts/PostDetailPage";
import CreatePostPage from "./pages/Posts/CreatePostPage";

// User pages - TODO: Move to features/users/pages
import ProfilePage from "./pages/User/ProfilePage";
import DashboardPage from "./pages/User/DashboardPage";
import OrdersPage from "./pages/User/OrdersPage";
import WishlistPage from "./pages/User/WishlistPage";
import ViewHistoryPage from "./pages/User/ViewHistoryPage";

// Admin page - TODO: Move to features/admin/pages
import AdminPage from "./pages/Admin/AdminPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/posts"
        element={
          <Layout>
            <PostsPage />
          </Layout>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <Layout>
            <PostDetailPage />
          </Layout>
        }
      />
      <Route
        path="/posts/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreatePostPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Layout>
              <WishlistPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-history"
        element={
          <ProtectedRoute>
            <Layout>
              <ViewHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
