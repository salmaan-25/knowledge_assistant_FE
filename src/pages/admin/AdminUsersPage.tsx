import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Skeleton,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
  Pagination,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Block as BanIcon,
  CheckCircle as ActiveIcon,
  Edit as EditIcon,
  Token as TokenIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  useAdminGetUsersQuery,
  useAdminUpdateRoleMutation,
  useAdminUpdateStatusMutation,
  useAdminUpdateLimitMutation,
  useGetMeQuery,
} from "../../store/api/apiSlice";
import type { AdminUser, UserRole } from "../../types/admin";

// ── Edit User Dialog ─────────────────────────────────────────────────────────
function EditUserDialog({
  user,
  open,
  onClose,
  currentUserId,
}: {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}) {
  const theme = useTheme();
  const [updateRole, { isLoading: roleLoading }] = useAdminUpdateRoleMutation();
  const [updateStatus, { isLoading: statusLoading }] = useAdminUpdateStatusMutation();
  const [updateLimit, { isLoading: limitLoading }] = useAdminUpdateLimitMutation();

  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [limitStr, setLimitStr] = useState<string>(
    user.custom_daily_token_limit != null
      ? String(user.custom_daily_token_limit)
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSelf = currentUserId === user.id;
  const busy = roleLoading || statusLoading || limitLoading;

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      const promises: Promise<any>[] = [];

      if (role !== user.role) {
        promises.push(updateRole({ userId: user.id, role }).unwrap());
      }
      if (isActive !== user.is_active) {
        promises.push(updateStatus({ userId: user.id, is_active: isActive }).unwrap());
      }
      const parsedLimit =
        limitStr.trim() === "" ? null : parseInt(limitStr.trim(), 10);
      const limitChanged =
        parsedLimit !== user.custom_daily_token_limit;
      if (limitChanged) {
        promises.push(
          updateLimit({
            userId: user.id,
            custom_daily_token_limit: parsedLimit,
          }).unwrap()
        );
      }

      await Promise.all(promises);
      setSuccess("User updated successfully.");
      setTimeout(onClose, 1000);
    } catch (e: any) {
      const msg =
        e?.data?.detail || e?.data?.message || "Failed to update user.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <Avatar
          sx={{
            background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
            width: 36,
            height: 36,
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          {(user.full_name || user.email).charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {user.full_name || "No name"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Today's usage summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
              TODAY'S USAGE
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user.tokens_used_today.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">tokens</Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user.queries_today}
                </Typography>
                <Typography variant="caption" color="text.secondary">queries</Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user.total_documents}
                </Typography>
                <Typography variant="caption" color="text.secondary">documents</Typography>
              </Box>
            </Box>
          </Box>

          {/* Role */}
          <FormControl fullWidth size="small" disabled={isSelf}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            {isSelf && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Cannot change your own role.
              </Typography>
            )}
          </FormControl>

          {/* Status */}
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSelf}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Account active
                </Typography>
                {isSelf && (
                  <Typography variant="caption" color="text.secondary">
                    Cannot deactivate your own account.
                  </Typography>
                )}
              </Box>
            }
          />

          {/* Token limit */}
          <TextField
            label="Custom daily token limit"
            size="small"
            fullWidth
            value={limitStr}
            onChange={(e) =>
              setLimitStr(e.target.value.replace(/[^0-9]/g, ""))
            }
            helperText="Leave empty to use the system default. Set to 0 to block queries."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <TokenIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={busy}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── User Row ─────────────────────────────────────────────────────────────────
function UserRow({
  user,
  currentUserId,
}: {
  user: AdminUser;
  currentUserId?: string;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          "&:hover": { background: alpha(theme.palette.primary.main, 0.03) },
          cursor: "pointer",
        }}
        onClick={() => setOpen(true)}
      >
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.8rem",
                fontWeight: 700,
                background: user.is_active
                  ? "linear-gradient(135deg, #7C5CFC, #22D3EE)"
                  : theme.palette.action.disabled,
              }}
            >
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.full_name || "—"}
                {currentUserId === user.id && (
                  <Chip
                    label="You"
                    size="small"
                    sx={{ ml: 0.75, height: 16, fontSize: "0.6rem" }}
                    color="primary"
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={user.role}
            icon={user.role === "admin" ? <AdminIcon sx={{ fontSize: "14px !important" }} /> : <UserIcon sx={{ fontSize: "14px !important" }} />}
            color={user.role === "admin" ? "secondary" : "default"}
            variant={user.role === "admin" ? "filled" : "outlined"}
          />
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={user.is_active ? "Active" : "Banned"}
            icon={
              user.is_active
                ? <ActiveIcon sx={{ fontSize: "14px !important" }} />
                : <BanIcon sx={{ fontSize: "14px !important" }} />
            }
            color={user.is_active ? "success" : "error"}
            variant="outlined"
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {user.tokens_used_today.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.queries_today} queries
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{user.total_documents}</Typography>
        </TableCell>

        <TableCell>
          {user.custom_daily_token_limit != null ? (
            <Chip
              size="small"
              label={`${user.custom_daily_token_limit.toLocaleString()} tkns`}
              color="warning"
              variant="outlined"
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              Default
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {new Date(user.created_at).toLocaleDateString()}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Tooltip title="Edit user">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {open && (
        <EditUserDialog
          user={user}
          open={open}
          onClose={() => setOpen(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedEmail(emailFilter);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [emailFilter]);

  const { data: me } = useGetMeQuery();
  const { data, isLoading, error } = useAdminGetUsersQuery({
    page,
    page_size: 15,
    email_filter: debouncedEmail || undefined,
    role_filter: (roleFilter as UserRole) || undefined,
  });

  const pageCount = data ? Math.ceil(data.total / 15) : 1;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage roles, account status, and token limits for all platform users.
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by email..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => {
              setRoleFilter(e.target.value as "" | UserRole);
              setPage(1);
            }}
          >
            <MenuItem value="">All roles</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        {data && (
          <Chip
            label={`${data.total} user${data.total !== 1 ? "s" : ""}`}
            sx={{ alignSelf: "center" }}
            size="small"
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Failed to load users. Make sure you have admin privileges.
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                {["User", "Role", "Status", "Today's Usage", "Docs", "Token Limit", "Joined", ""].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.users.map((u) => (
                    <UserRow key={u.id} user={u} currentUserId={me?.id} />
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        {!isLoading && data && data.total === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No users found.</Typography>
          </Box>
        )}
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
