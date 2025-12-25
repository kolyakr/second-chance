import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import App from "./App";
import theme from "./theme";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Не повторюємо запити при 429 (Too Many Requests) - чекаємо на клієнті
        if (error?.response?.status === 429) {
          return false;
        }
        // Для інших помилок - максимум 2 спроби
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // Експоненційна затримка: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 5000);
      },
      staleTime: 30 * 1000, // Дані вважаються свіжими 30 секунд
      gcTime: 5 * 60 * 1000, // Кеш зберігається 5 хвилин
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Toaster position="top-right" />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
