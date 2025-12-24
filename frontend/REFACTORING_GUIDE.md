# Frontend Refactoring Guide

## New Feature-Based Structure

The frontend has been refactored to use a **feature-based architecture** with React Query for data fetching and Zustand for state management.

### Directory Structure

```
src/
├── features/              # Feature modules
│   ├── auth/             # Authentication feature
│   │   ├── api/          # API calls
│   │   ├── hooks/        # React Query hooks
│   │   ├── pages/        # Feature pages
│   │   └── store/        # Zustand store
│   ├── posts/            # Posts feature
│   │   ├── api/          # API calls (postsApi, commentsApi, likesApi, reviewsApi)
│   │   ├── hooks/        # React Query hooks (usePosts, useComments, useLikes, useReviews)
│   │   ├── components/   # Post-related components
│   │   └── pages/        # Post pages
│   ├── users/            # Users feature
│   ├── messages/         # Messages feature
│   ├── admin/            # Admin feature
│   └── notifications/    # Notifications feature
├── shared/               # Shared code
│   ├── components/       # Shared components (Layout, ProtectedRoute)
│   ├── config/           # Configuration (api, socket)
│   └── utils/            # Utilities (upload)
└── pages/                # Legacy pages (to be migrated)
```

## Migration Status

### ✅ Completed

- **Auth Feature**: Fully migrated

  - Store: `features/auth/store/authStore.ts`
  - API: `features/auth/api/authApi.ts`
  - Hooks: `features/auth/hooks/useAuth.ts`
  - Pages: `features/auth/pages/*.tsx`

- **Posts Feature API & Hooks**: Created

  - API: `features/posts/api/*.ts`
  - Hooks: `features/posts/hooks/*.ts`

- **Shared**: Created
  - Config: `shared/config/api.ts`, `shared/config/socket.ts`
  - Utils: `shared/utils/upload.ts`
  - Components: `shared/components/ProtectedRoute.tsx`

### 🔄 In Progress / TODO

- **Posts Feature**: Components and pages need to be moved and updated
- **Users Feature**: Needs to be created
- **Messages Feature**: Needs to be created
- **Admin Feature**: Needs to be created
- **Notifications Feature**: Needs to be created
- **Layout Components**: Move to `shared/components/Layout/`

## How to Use

### Using Auth Feature

```tsx
import { useLogin, useRegister } from "../features/auth/hooks/useAuth";
import { useAuthStore } from "../features/auth/store/authStore";

// In component
const loginMutation = useLogin();
const { user, isAuthenticated } = useAuthStore();

loginMutation.mutate(
  { email, password },
  {
    onSuccess: () => {
      // Handle success
    },
  }
);
```

### Using Posts Feature

```tsx
import {
  usePosts,
  usePost,
  useCreatePost,
} from "../features/posts/hooks/usePosts";
import {
  usePostComments,
  useCreateComment,
} from "../features/posts/hooks/useComments";
import { useToggleLike } from "../features/posts/hooks/useLikes";

// Fetch posts
const { data, isLoading } = usePosts({ category: "men", page: 1 });

// Fetch single post
const { data: post } = usePost(postId);

// Create post
const createPost = useCreatePost();
createPost.mutate(postData);

// Comments
const { data: comments } = usePostComments(postId);
const createComment = useCreateComment();
createComment.mutate({ postId, content: "Great post!" });

// Likes
const toggleLike = useToggleLike();
toggleLike.mutate(postId);
```

## Migration Steps for Remaining Features

1. **Move Components**: Move feature-specific components to `features/[feature]/components/`
2. **Update Imports**: Replace old service imports with new hook imports
3. **Update Pages**: Move pages to `features/[feature]/pages/` and update to use hooks
4. **Test**: Verify all functionality works with new structure

## Benefits

- **Better Organization**: Code grouped by feature, easier to find and maintain
- **Consistent Data Fetching**: All data fetching through React Query hooks
- **Centralized State**: Zustand stores for feature-specific state
- **Reusability**: Hooks can be easily reused across components
- **Type Safety**: TypeScript interfaces defined in API files
- **Better Testing**: Features can be tested in isolation
