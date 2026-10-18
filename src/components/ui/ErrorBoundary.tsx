import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Refresh as RefreshIcon, Home as HomeIcon } from "@mui/icons-material";

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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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
            bgcolor: "background.default",
          }}
        >
          <Card sx={{ maxWidth: 500, width: "100%", textAlign: "center", p: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                An unexpected error occurred while rendering this page.
              </Typography>
              {this.state.error && (
                <Box
                  sx={{
                    p: 1.5,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    textAlign: "left",
                    overflowX: "auto",
                  }}
                >
                  {this.state.error.message}
                </Box>
              )}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={this.handleReset}
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
