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
  Person as PersonIcon,
} from "@mui/icons-material";
import { useRegisterMutation, useLoginMutation } from "../../store/api/apiSlice";
import { useAppDispatch } from "../../hooks/useAppStore";
import { setCredentials } from "../../store/slices/authSlice";

export function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register] = useRegisterMutation();
  const [login, { isLoading }] = useLoginMutation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register({
        full_name: fullName,
        email,
        password,
      }).unwrap();

      // Auto-login after successful registration
      const loginRes = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: loginRes.access_token }));
      navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string }; status?: number };
      if (e.status === 400 && e.data?.detail) {
        setError(e.data.detail);
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 440 }}>
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
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Start learning smarter today
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
              label="Full name"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              autoComplete="new-password"
              helperText="Minimum 8 characters"
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
              disabled={isLoading || !fullName || !email || !password}
              sx={{ py: 1.25 }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Create account"
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          <Button
            component={Link}
            to="/login"
            variant="outlined"
            fullWidth
            sx={{ py: 1.25 }}
          >
            Sign in instead
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
