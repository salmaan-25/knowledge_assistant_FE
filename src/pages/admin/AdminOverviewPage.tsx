import type React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Chip,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
  Description as DocsIcon,
  QueryStats as QueriesIcon,
  Token as TokenIcon,
  PersonSearch as ActiveIcon,
  TrendingUp as TrendIcon,
  Block as InactiveIcon,
} from "@mui/icons-material";
import {
  useAdminGetStatsQuery,
} from "../../store/api/apiSlice";
import type { DailyUsageStat } from "../../types/admin";

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        border: `1px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, ${alpha(
          theme.palette.background.paper,
          0
        )} 100%)`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: alpha(color, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function UsageBar({
  stat,
  maxTokens,
}: {
  stat: DailyUsageStat;
  maxTokens: number;
}) {
  const theme = useTheme();
  const pct = maxTokens > 0 ? Math.min((stat.total_tokens / maxTokens) * 100, 100) : 0;
  const dateStr = new Date(stat.usage_date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {dateStr}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {stat.total_tokens.toLocaleString()} tokens
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stat.total_queries} queries
          </Typography>
          <Chip
            size="small"
            label={`${stat.active_users} users`}
            sx={{ height: 18, fontSize: "0.65rem" }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          background: alpha(theme.palette.primary.main, 0.12),
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            background: `linear-gradient(90deg, #7C5CFC, #22D3EE)`,
            transition: "width 0.6s ease",
          }}
        />
      </Box>
    </Box>
  );
}

export function AdminOverviewPage() {
  const theme = useTheme();
  const { data: stats, isLoading, error } = useAdminGetStatsQuery();

  const maxTokens = stats
    ? Math.max(...stats.daily_usage.map((d) => d.total_tokens), 1)
    : 1;

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton variant="text" width={220} height={36} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={300} height={22} sx={{ mb: 3 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[...Array(8)].map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load admin statistics. Make sure you have admin privileges.
        </Alert>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.total_users,
      icon: <UsersIcon fontSize="small" />,
      color: theme.palette.primary.main,
      sub: `${stats.active_users} active`,
    },
    {
      label: "Admins",
      value: stats.admin_users,
      icon: <AdminIcon fontSize="small" />,
      color: "#7C5CFC",
      sub: `${stats.basic_users} regular users`,
    },
    {
      label: "Active Users",
      value: stats.active_users,
      icon: <ActiveIcon fontSize="small" />,
      color: theme.palette.success.main,
      sub: `${stats.inactive_users} inactive/banned`,
    },
    {
      label: "Banned/Inactive",
      value: stats.inactive_users,
      icon: <InactiveIcon fontSize="small" />,
      color: theme.palette.error.main,
    },
    {
      label: "Total Documents",
      value: stats.total_documents,
      icon: <DocsIcon fontSize="small" />,
      color: theme.palette.info.main,
    },
    {
      label: "Tokens Today",
      value: stats.tokens_consumed_today.toLocaleString(),
      icon: <TokenIcon fontSize="small" />,
      color: "#F59E0B",
      sub: "platform-wide",
    },
    {
      label: "Queries Today",
      value: stats.queries_today,
      icon: <QueriesIcon fontSize="small" />,
      color: "#22D3EE",
    },
    {
      label: "Active Today",
      value: stats.active_users_today,
      icon: <TrendIcon fontSize="small" />,
      color: theme.palette.secondary.main,
      sub: "unique users",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Admin Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Platform-wide metrics and usage trends.
      </Typography>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((s) => (
          <Grid key={s.label} size={{ xs: 6, sm: 4, md: 3 }}>
            <StatCard
              label={s.label}
              value={s.value}
              icon={s.icon}
              color={s.color}
              sub={s.sub}
            />
          </Grid>
        ))}
      </Grid>

      {/* Daily usage trend */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <TrendIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              7-Day Usage Trend
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {stats.daily_usage.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No usage data yet.
            </Alert>
          ) : (
            [...stats.daily_usage]
              .sort((a, b) => b.usage_date.localeCompare(a.usage_date))
              .map((stat) => (
                <UsageBar key={stat.usage_date} stat={stat} maxTokens={maxTokens} />
              ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
