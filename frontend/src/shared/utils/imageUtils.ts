/**
 * Utility functions for handling image URLs
 * Supports both local development and production deployment
 */

/**
 * Get the base URL for API requests (without /api suffix)
 * Falls back to localhost:5000 for local development
 */
export const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  // Remove /api suffix if present
  return apiUrl.replace(/\/api\/?$/, "");
};

/**
 * Get full image URL from a relative path
 * @param path - Relative path to the image (e.g., "/uploads/image.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | undefined | null): string => {
  if (!path) return "/placeholder-image.jpg";
  
  // If already a full URL (starts with http), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Get base URL and append path
  const baseUrl = getBaseUrl();
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === "development";
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.MODE === "production";
};

