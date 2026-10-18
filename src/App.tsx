import { useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { store } from "./store";
import { AppRoutes } from "./routes/AppRoutes";
import { useAppSelector } from "./hooks/useAppStore";
import { getTheme } from "./lib/theme";

import { ErrorBoundary } from "./components/ui/ErrorBoundary";

function ThemedApp() {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}
