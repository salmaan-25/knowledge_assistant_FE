import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Refresh as RefreshIcon, Home as HomeIcon, ErrorOutlined as ErrorIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.12) 0%, rgba(124,92,252,0.06) 50%, transparent 70%), #0D0F17"
                : "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.08) 0%, rgba(98,72,232,0.05) 50%, transparent 70%), #F4F6FD",
          }}
        >
          <Card
            sx={{
              maxWidth: 520,
              width: "100%",
              textAlign: "center",
              borderRadius: 4,
              p: { xs: 2, sm: 3.5 },
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 24px 64px rgba(0,0,0,0.6)"
                  : "0 12px 48px rgba(0,0,0,0.12)",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 1 }}>
              {/* App Logo */}
              <Box
                component="img"
                src="/KA_logo.png"
                alt="Knowledge Assistant"
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "16px",
                  objectFit: "contain",
                  background: "#ffffff",
                  p: 0.8,
                  mb: 2.5,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  display: "inline-block",
                }}
              />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                <ErrorIcon color="error" sx={{ fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Something went wrong
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                An unexpected error occurred while loading this view. You can reload the page or return to the dashboard.
              </Typography>

              {this.state.error && (
                <Box
                  sx={{
                    p: 1.5,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    textAlign: "left",
                    color: "error.main",
                    overflowX: "auto",
                    maxHeight: 120,
                  }}
                >
                  {this.state.error.message || String(this.state.error)}
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{ borderRadius: 2.5, px: 2.5 }}
                >
                  Reload Page
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={this.handleReset}
                  sx={{
                    borderRadius: 2.5,
                    px: 3,
                    background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
                    color: "#ffffff",
                    boxShadow: "0 4px 16px rgba(124,92,252,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #6B4BF5, #06B6D4)",
                    },
                  }}
                >
                  Return to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}
