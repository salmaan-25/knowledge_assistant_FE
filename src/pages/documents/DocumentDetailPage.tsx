import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Skeleton,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon,
  Description as DocIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import {
  useGetDocumentQuery,
  useGetDocumentProgressQuery,
  useGetWeakTopicsQuery,
} from "../../store/api/apiSlice";

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: doc, isLoading } = useGetDocumentQuery(id!, { skip: !id });
  const { data: progress } = useGetDocumentProgressQuery(id!, {
    skip: !id || doc?.status !== "ready",
  });
  const { data: weakTopics } = useGetWeakTopicsQuery(id!, {
    skip: !id || doc?.status !== "ready",
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!doc) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Document not found.</Typography>
        <Button component={Link} to="/documents" sx={{ mt: 2 }}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  const statusConfig = {
    ready: { label: "Ready", color: "success" as const, icon: <CheckIcon /> },
    pending: { label: "Indexing", color: "warning" as const, icon: <PendingIcon /> },
    processing: { label: "Processing", color: "warning" as const, icon: <PendingIcon /> },
    failed: { label: "Failed", color: "error" as const, icon: <ErrorIcon /> },
  };
  const sc = statusConfig[doc.status];

  const attempts =
    progress?.total_quiz_attempts ??
    progress?.total_attempts ??
    progress?.quiz_history?.length ??
    0;

  const topicsList =
    progress?.topic_performance ?? progress?.topic_breakdown ?? [];

  const avgScore =
    progress?.average_score_percentage != null
      ? progress.average_score_percentage
      : progress?.quiz_history && progress.quiz_history.length > 0
      ? progress.quiz_history.reduce((acc, q) => acc + (q.percentage || 0), 0) /
        progress.quiz_history.length
      : null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2.5, color: "text.secondary" }}
      >
        Back
      </Button>

      {/* Document header card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                background: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DocIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700, mb: 0.5 }}>
                {doc.original_filename}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={sc.label}
                  color={sc.color}
                  icon={sc.icon}
                />
                {doc.page_count != null && (
                  <Chip size="small" label={`${doc.page_count} pages`} variant="outlined" />
                )}
                {doc.total_chunks != null && (
                  <Chip size="small" label={`${doc.total_chunks} chunks`} variant="outlined" />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Uploaded {new Date(doc.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          {doc.status === "ready" && (
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => navigate(`/chat/${doc.id}`)}
                sx={{ flex: 1 }}
              >
                Chat with this document
              </Button>
              <Button
                variant="contained"
                startIcon={<QuizIcon />}
                onClick={() => navigate(`/quiz/${doc.id}`)}
                sx={{ flex: 1 }}
              >
                Generate quiz
              </Button>
            </Box>
          )}

          {(doc.status === "pending" || doc.status === "processing") && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Indexing in progress...
              </Typography>
              <LinearProgress
                sx={{
                  borderRadius: 4,
                  height: 6,
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #7C5CFC, #22D3EE)",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Progress section */}
      {attempts > 0 ? (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quiz performance
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {avgScore != null ? `${avgScore.toFixed(0)}%` : "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {attempts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quiz attempts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {topicsList.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Topics covered
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Topic breakdown */}
          {topicsList.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Topic breakdown
                </Typography>
                {topicsList.map((t, i) => {
                  const acc = t.accuracy_percentage ?? (t as any).accuracy ?? 0;
                  return (
                    <Box key={t.topic} sx={{ mb: i < topicsList.length - 1 ? 2 : 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t.topic}
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 600,
                          color: acc >= 70 ? "success.main" : "error.main",
                        }}>
                          {acc.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={acc}
                        color={acc >= 70 ? "success" : "error"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t.correct}/{t.attempts} correct
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              No quizzes taken yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Test your knowledge of this document by generating an interactive AI quiz.
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate(`/quiz/${doc.id}`)}
            >
              Take a quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weak topics */}
      {weakTopics && weakTopics.weak_topics && weakTopics.weak_topics.length > 0 && (
        <Card
          sx={{
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            background: alpha(theme.palette.warning.main, 0.04),
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Areas to revise
            </Typography>
            {weakTopics.recommendation && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {weakTopics.recommendation}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {weakTopics.weak_topics.map((t) => {
                const acc = t.accuracy_percentage ?? (t as any).accuracy ?? 0;
                return (
                  <Chip
                    key={t.topic}
                    label={`${t.topic} (${acc.toFixed(0)}%)`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
