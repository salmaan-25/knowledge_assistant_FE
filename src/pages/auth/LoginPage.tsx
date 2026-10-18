import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useLoginMutation } from "../../store/api/apiSlice";
import { useAppDispatch } from "../../hooks/useAppStore";
import { setCredentials } from "../../store/slices/authSlice";

export function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: res.access_token }));
      navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string | { msg?: string }[] }; status?: number };
      if (typeof e.data?.detail === "string") {
        setError(e.data.detail);
      } else if (e.status === 401) {
        setError("Incorrect email or password.");
      } else if (e.status === 403) {
        setError("This account is inactive.");
      } else {
        setError("Something went wrong. Please check your credentials and try again.");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420 }}>
      {/* Brand mark */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Box
          component="img"
          src="/KA_logo.png"
          alt="Knowledge Assistant"
          sx={{
            width: 130,
            height: 130,
            borderRadius: "24px",
            objectFit: "contain",
            background: "#ffffff",
            p: 1.5,
            mb: 2.5,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 12px 40px rgba(0,0,0,0.5)"
                : "0 12px 40px rgba(124,92,252,0.18)",
            display: "inline-block",
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Sign in to your account
        </Typography>
      </Box>

      <Card
        sx={{
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 64px rgba(0,0,0,0.5)"
              : "0 8px 40px rgba(98,72,232,0.10)",
        }}
      >
        <CardContent sx={{ p: 3.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || !email || !password}
              sx={{ py: 1.25 }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Sign in"
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              Don&apos;t have an account?
            </Typography>
          </Divider>

          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            sx={{ py: 1.25 }}
          >
            Create account
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
