import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DocIcon,
  Chat as ChatIcon,
  TrendingUp as ProgressIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  AdminPanelSettings as AdminPanelIcon,
  People as PeopleIcon,
  BarChart as StatsIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../hooks/useAppStore";
import { toggleTheme } from "../store/slices/uiSlice";
import { useGetMeQuery } from "../store/api/apiSlice";

const DRAWER_WIDTH = 248;
const DRAWER_COLLAPSED = 64;

const mainNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Documents", path: "/documents", icon: <DocIcon /> },
  { label: "Chat / Study", path: "/chat", icon: <ChatIcon /> },
  { label: "Progress", path: "/progress", icon: <ProgressIcon /> },
];

const adminNavItems = [
  { label: "Overview", path: "/admin", icon: <StatsIcon />, exact: true },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, token, logout, setUser: setAuthUser } = useAuth();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const { data: me } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (me && !user) {
      setAuthUser(me);
    }
  }, [me, user, setAuthUser]);

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #13161F 0%, #0D0F17 100%)"
            : theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: collapsed ? 1.5 : 2,
          py: collapsed ? 1.5 : 2,
          minHeight: collapsed ? 64 : 100,
        }}
      >
        <Box
          component="img"
          src="/KA_logo.png"
          alt="Knowledge Assistant"
          sx={{
            width: collapsed ? 44 : 148,
            maxHeight: collapsed ? 44 : 96,
            borderRadius: collapsed ? "10px" : "14px",
            objectFit: "contain",
            background: "#ffffff",
            p: collapsed ? 0.4 : 1,
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "0 4px 16px rgba(0,0,0,0.4)"
                : "0 4px 16px rgba(0,0,0,0.08)",
            transition: "all 0.25s ease-in-out",
          }}
        />
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Navigation */}
      <List sx={{ pt: 1.5, px: 0.5, flex: 1 }}>
        {mainNavItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip
                title={collapsed ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: "8px",
                    mx: 0.5,
                    mb: 0.25,
                    px: 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    minHeight: 42,
                    background: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : "transparent",
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    "&:hover": {
                      background: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                    },
                    borderLeft: isActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : "3px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: "inherit",
                      mr: collapsed ? 0 : 1,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: isActive ? 600 : 500,
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}

        {/* Admin section — only visible to admins */}
        {me?.role === "admin" && (
          <>
            <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />
            {!collapsed && (
              <Box sx={{ px: 2, mb: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
                <AdminPanelIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
                  Admin
                </Typography>
              </Box>
            )}
            {adminNavItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <ListItem key={item.path} disablePadding>
                  <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={() => isMobile && setMobileOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mx: 0.5,
                        mb: 0.25,
                        px: 1.5,
                        justifyContent: collapsed ? "center" : "flex-start",
                        minHeight: 42,
                        background: isActive
                          ? alpha(theme.palette.warning.main, 0.12)
                          : "transparent",
                        color: isActive
                          ? theme.palette.warning.main
                          : theme.palette.text.secondary,
                        "&:hover": {
                          background: alpha(theme.palette.warning.main, 0.08),
                          color: theme.palette.warning.main,
                        },
                        borderLeft: isActive
                          ? `3px solid ${theme.palette.warning.main}`
                          : "3px solid transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: "inherit", mr: collapsed ? 0 : 1 }}>
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }}>
                              {item.label}
                            </Typography>
                          }
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </>
        )}
      </List>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Bottom controls */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              color: theme.palette.error.main,
              justifyContent: collapsed ? "center" : "flex-start",
              px: 1.5,
              minHeight: 40,
            }}
          >
            <ListItemIcon
              sx={{ minWidth: collapsed ? 0 : 36, color: "inherit", mr: collapsed ? 0 : 1 }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    Sign out
                  </Typography>
                }
              />
            )}
          </ListItemButton>
        </Tooltip>

        {!collapsed && user && (
          <>
            <Divider sx={{ borderColor: theme.palette.divider, my: 0.5 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: "block", lineHeight: 1.2 }}
                  noWrap
                >
                  {user.full_name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: "0.7rem" }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.25s ease",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.25s ease",
              overflowX: "hidden",
              boxSizing: "border-box",
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: (t) => t.palette.background.default,
        }}
      >
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: (t) =>
              t.palette.mode === "dark"
                ? alpha(t.palette.background.paper, 0.85)
                : alpha(t.palette.background.paper, 0.9),
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: "56px !important" }}>
            {isMobile ? (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                size="small"
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <IconButton
                edge="start"
                size="small"
                onClick={() => setCollapsed((c) => !c)}
              >
                <ChevronLeftIcon
                  sx={{
                    transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                  }}
                />
              </IconButton>
            )}

            <Box sx={{ flex: 1 }} />

            <Tooltip title="Toggle theme">
              <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
                {themeMode === "dark" ? (
                  <LightIcon fontSize="small" />
                ) : (
                  <DarkIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {user
                ? (user.full_name || user.email).charAt(0).toUpperCase()
                : "U"}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
