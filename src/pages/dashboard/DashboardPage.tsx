import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Description as DocIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
  Chat as ChatIcon,
  Upload as UploadIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import {
  useListDocumentsQuery,
  useGetOverallProgressQuery,
} from "../../store/api/apiSlice";
import { useAuth } from "../../hooks/useAuth";
import type { DocumentMetadata } from "../../types/api";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: alpha(color, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DocStatusChip({ status }: { status: DocumentMetadata["status"] }) {
  const map = {
    ready: { label: "Ready", color: "success" as const, icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    pending: { label: "Processing", color: "warning" as const, icon: <PendingIcon sx={{ fontSize: 12 }} /> },
    processing: { label: "Processing", color: "warning" as const, icon: <PendingIcon sx={{ fontSize: 12 }} /> },
    failed: { label: "Failed", color: "error" as const, icon: <ErrorIcon sx={{ fontSize: 12 }} /> },
  };
  const m = map[status] || map.pending;
  return (
    <Chip
      size="small"
      label={m.label}
      color={m.color}
      icon={m.icon}
      sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.7rem", px: 0.75 } }}
    />
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: docsData, isLoading: docsLoading } = useListDocumentsQuery({});
  const { data: progress, isLoading: progressLoading } = useGetOverallProgressQuery();

  const greeting = getGreeting();
  const readyDocs = docsData?.documents.filter((d) => d.status === "ready") ?? [];

  const totalQuizzes =
    progress?.total_quiz_attempts ?? progress?.total_quizzes_taken ?? 0;
  const accuracyPct =
    progress?.average_score_percentage ??
    progress?.overall_accuracy_percentage ??
    null;
  const topicsCount =
    progress?.topics_tracked ?? progress?.total_questions_answered ?? 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          {greeting},{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {user?.full_name?.split(" ")[0] || "there"}
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your study overview for today.
        </Typography>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          {progressLoading ? (
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Documents"
              value={docsData?.total ?? 0}
              subtitle={`${readyDocs.length} ready`}
              icon={<DocIcon />}
              color={theme.palette.primary.main}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {progressLoading ? (
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Quizzes taken"
              value={totalQuizzes}
              subtitle="all time"
              icon={<QuizIcon />}
              color={theme.palette.secondary.main}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {progressLoading ? (
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Topics tracked"
              value={topicsCount}
              icon={<ProgressIcon />}
              color={theme.palette.success.main}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {progressLoading ? (
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Accuracy"
              value={accuracyPct != null ? `${accuracyPct.toFixed(0)}%` : "—"}
              subtitle="overall score"
              icon={<CheckIcon />}
              color={theme.palette.warning.main}
            />
          )}
        </Grid>
      </Grid>

      {/* Accuracy bar */}
      {progress && totalQuizzes > 0 && accuracyPct != null && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2">Overall Accuracy</Typography>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ fontWeight: 700 }}
              >
                {accuracyPct.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={accuracyPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #7C5CFC, #22D3EE)",
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.75, display: "block" }}
            >
              Based on {totalQuizzes} quiz attempt{totalQuizzes !== 1 ? "s" : ""}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Documents section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent documents
        </Typography>
        <Button
          component={Link}
          to="/documents"
          size="small"
          endIcon={<ArrowIcon />}
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          View all
        </Button>
      </Box>

      {docsLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : docsData && docsData.documents.length > 0 ? (
        <Grid container spacing={2}>
          {docsData.documents.slice(0, 6).map((doc) => (
            <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 8px 32px rgba(124,92,252,0.2)"
                        : "0 8px 32px rgba(98,72,232,0.12)",
                  },
                }}
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DocIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 20 }}
                      />
                    </Box>
                    <DocStatusChip status={doc.status} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {doc.original_filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.page_count != null ? `${doc.page_count} pages` : "—"}{" "}
                    {doc.total_chunks != null
                      ? `· ${doc.total_chunks} chunks`
                      : ""}
                  </Typography>

                  {doc.status === "ready" && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ChatIcon sx={{ fontSize: 14 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${doc.id}`);
                        }}
                        sx={{
                          flex: 1,
                          fontSize: "0.72rem",
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Chat
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<QuizIcon sx={{ fontSize: 14 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/${doc.id}`);
                        }}
                        sx={{
                          flex: 1,
                          fontSize: "0.72rem",
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Quiz
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            boxShadow: "none",
            background: "transparent",
          }}
        >
          <CardContent
            sx={{
              p: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <DocIcon
              sx={{
                fontSize: 48,
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a PDF to get started with AI-powered studying.
            </Typography>
            <Button
              component={Link}
              to="/documents"
              variant="contained"
              startIcon={<UploadIcon />}
            >
              Upload document
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
