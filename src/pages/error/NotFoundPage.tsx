import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as BackIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

export function NotFoundPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background: (t) =>
          t.palette.mode === "dark"
            ? "radial-gradient(ellipse at 50% 30%, rgba(124,92,252,0.15) 0%, rgba(34,211,238,0.06) 50%, transparent 70%), #0D0F17"
            : "radial-gradient(ellipse at 50% 30%, rgba(98,72,232,0.10) 0%, rgba(8,145,178,0.05) 50%, transparent 70%), #F4F6FD",
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          borderRadius: 4,
          p: { xs: 2, sm: 3.5 },
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 64px rgba(0,0,0,0.6)"
              : "0 12px 48px rgba(98,72,232,0.12)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: 1 }}>
          {/* Brand Logo */}
          <Box
            component="img"
            src="/KA_logo.png"
            alt="Knowledge Assistant"
            sx={{
              width: 80,
              height: 80,
              borderRadius: "18px",
              objectFit: "contain",
              background: "#ffffff",
              p: 0.8,
              mb: 3,
              boxShadow: "0 8px 24px rgba(124,92,252,0.2)",
              display: "inline-block",
            }}
          />

          {/* 404 Large Gradient Text */}
          <Box sx={{ position: "relative", mb: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "5rem", sm: "6.5rem" },
                lineHeight: 1,
                background: "linear-gradient(135deg, #7C5CFC 0%, #22D3EE 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-2px",
                userSelect: "none",
              }}
            >
              404
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <SearchOffIcon sx={{ color: theme.palette.text.secondary, fontSize: 22 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Page Not Found
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
          >
            The page you're looking for doesn't exist, has been removed, or the link may be broken.
          </Typography>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 2.5,
                px: 2.5,
                borderColor: theme.palette.divider,
                color: "text.primary",
                "&:hover": {
                  borderColor: theme.palette.text.primary,
                  background: alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
              sx={{
                borderRadius: 2.5,
                px: 3,
                background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
                boxShadow: "0 4px 16px rgba(124,92,252,0.3)",
                color: "#ffffff",
                "&:hover": {
                  background: "linear-gradient(135deg, #6B4BF5, #06B6D4)",
                  boxShadow: "0 6px 20px rgba(124,92,252,0.4)",
                },
              }}
            >
              {isAuthenticated ? "Dashboard" : "Go to Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
