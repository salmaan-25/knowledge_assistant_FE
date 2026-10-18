import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  Divider,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  TrendingUp as TrendIcon,
  Quiz as QuizIcon,
  Warning as WeakIcon,
} from "@mui/icons-material";
import {
  useListDocumentsQuery,
  useGetOverallProgressQuery,
  useGetDocumentProgressQuery,
  useGetWeakTopicsQuery,
} from "../../store/api/apiSlice";

function AccuracyBar({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  const theme = useTheme();
  const color =
    value >= 70
      ? theme.palette.success.main
      : value >= 40
      ? theme.palette.warning.main
      : theme.palette.error.main;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, color }}>
          {value.toFixed(0)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(color, 0.12),
          "& .MuiLinearProgress-bar": {
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
}

export function ProgressPage() {
  const { documentId: paramDocId } = useParams<{ documentId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedDocId, setSelectedDocId] = useState(paramDocId || "");

  const { data: overall, isLoading: overallLoading } =
    useGetOverallProgressQuery();
  const { data: docsData } = useListDocumentsQuery({});
  const { data: docProgress, isLoading: docProgressLoading } =
    useGetDocumentProgressQuery(selectedDocId, { skip: !selectedDocId });
  const { data: weakTopics, isLoading: weakLoading } = useGetWeakTopicsQuery(
    selectedDocId,
    { skip: !selectedDocId }
  );

  const readyDocs =
    docsData?.documents.filter((d) => d.status === "ready") ?? [];

  const docAttempts =
    docProgress?.total_quiz_attempts ??
    docProgress?.total_attempts ??
    docProgress?.quiz_history?.length ??
    0;
  const docTopics =
    docProgress?.topic_performance ?? docProgress?.topic_breakdown ?? [];
  const docAvg =
    docProgress?.average_score_percentage != null
      ? docProgress.average_score_percentage
      : docProgress?.quiz_history && docProgress.quiz_history.length > 0
      ? docProgress.quiz_history.reduce((acc, q) => acc + (q.percentage || 0), 0) /
        docProgress.quiz_history.length
      : null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Learning Progress
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your accuracy and identify areas for improvement.
      </Typography>

      {/* Overall stats */}
      {overallLoading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton variant="rounded" height={90} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : overall ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            {
              label: "Overall Accuracy",
              value: `${(overall.average_score_percentage ?? overall.overall_accuracy_percentage ?? 0).toFixed(0)}%`,
              color: theme.palette.primary.main,
            },
            {
              label: "Quizzes Taken",
              value: overall.total_quiz_attempts ?? overall.total_quizzes_taken ?? 0,
              color: theme.palette.secondary.main,
            },
            {
              label: "Topics Tracked",
              value: overall.topics_tracked ?? overall.total_questions_answered ?? 0,
              color: theme.palette.success.main,
            },
            {
              label: "Weak Areas",
              value: overall.weak_topics?.length ?? 0,
              color: theme.palette.warning.main,
            },
          ].map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: s.color }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          No quiz data yet. Take a quiz to see your progress here.
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Per-document breakdown */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Document breakdown
        </Typography>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Select document</InputLabel>
          <Select
            value={selectedDocId}
            label="Select document"
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            {readyDocs.length === 0 ? (
              <MenuItem disabled>No documents ready</MenuItem>
            ) : (
              readyDocs.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  <Typography variant="body2" noWrap>
                    {d.original_filename}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      {!selectedDocId ? (
        <Card
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            boxShadow: "none",
            background: "transparent",
          }}
        >
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <TrendIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Select a document above to view its performance breakdown.
            </Typography>
          </CardContent>
        </Card>
      ) : docProgressLoading ? (
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
      ) : docProgress ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {docAvg != null ? `${docAvg.toFixed(0)}%` : "—"}
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
                    {docAttempts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total attempts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {docTopics.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Topics tracked
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {docTopics.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5 }}>
                  Topic accuracy
                </Typography>
                {docTopics.map((t) => {
                  const acc = t.accuracy_percentage ?? (t as any).accuracy ?? 0;
                  return (
                    <AccuracyBar
                      key={t.topic}
                      label={t.topic}
                      value={acc}
                      sub={`${t.correct}/${t.attempts} correct`}
                    />
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Weak topics */}
          {weakLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ) : weakTopics && (weakTopics.weak_topics?.length ?? 0) > 0 ? (
            <Card
              sx={{
                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                background: alpha(theme.palette.warning.main, 0.04),
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <WeakIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Areas to revise
                  </Typography>
                </Box>
                {weakTopics.recommendation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {weakTopics.recommendation}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {weakTopics.weak_topics.map((t) => {
                    const acc = t.accuracy_percentage ?? (t as any).accuracy ?? 0;
                    return (
                      <Chip
                        key={t.topic}
                        size="small"
                        label={`${t.topic} — ${acc.toFixed(0)}%`}
                        color="warning"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<QuizIcon />}
                  onClick={() => navigate(`/quiz/${selectedDocId}`)}
                >
                  Generate targeted quiz
                </Button>
              </CardContent>
            </Card>
          ) : weakTopics && (weakTopics.weak_topics?.length ?? 0) === 0 ? (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              No weak areas detected — you're performing well across all topics in this document.
            </Alert>
          ) : null}
        </>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No quiz data for this document yet. Take a quiz to start tracking progress.
        </Alert>
      )}
    </Box>
  );
}
