import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  alpha,
  useTheme,
  Collapse,
} from "@mui/material";
import {
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Replay as RetryIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useSubmitQuizMutation } from "../../store/api/apiSlice";
import type { QuizGenerateResponse, QuizSubmitResponse, SubmittedAnswerItem } from "../../types/api";

interface LocationState {
  quizId: string;
  answers: SubmittedAnswerItem[];
  quiz: QuizGenerateResponse;
  result?: QuizSubmitResponse;
}

function ScoreRing({ percentage }: { percentage: number }) {
  const theme = useTheme();
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  const color =
    percentage >= 70
      ? theme.palette.success.main
      : percentage >= 40
      ? theme.palette.warning.main
      : theme.palette.error.main;

  return (
    <Box sx={{ position: "relative", width: 130, height: 130, mx: "auto", my: 1 }}>
      <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={65}
          cy={65}
          r={r}
          fill="none"
          stroke={alpha(color, 0.15)}
          strokeWidth={10}
        />
        <circle
          cx={65}
          cy={65}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
          {(percentage ?? 0).toFixed(0)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          %
        </Typography>
      </Box>
    </Box>
  );
}

function ReviewCard({
  result,
  question,
  index,
}: {
  result: QuizSubmitResponse["results"][0];
  question: QuizGenerateResponse["questions"][0];
  index: number;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const color = result.is_correct ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(color, 0.25)}`,
        background: alpha(color, 0.03),
        mb: 1.5,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {result.is_correct ? (
            <CorrectIcon sx={{ color: theme.palette.success.main, mt: 0.25, flexShrink: 0 }} />
          ) : (
            <WrongIcon sx={{ color: theme.palette.error.main, mt: 0.25, flexShrink: 0 }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.5 }}>
              {index + 1}. {question.question_text}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: result.explanation ? 1 : 0 }}>
              <Chip
                size="small"
                label={`Your answer: ${result.submitted_answer}`}
                color={result.is_correct ? "success" : "error"}
                variant="outlined"
                sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.7rem" } }}
              />
              {!result.is_correct && (
                <Chip
                  size="small"
                  label={`Correct: ${result.correct_answer}`}
                  color="success"
                  sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.7rem" } }}
                />
              )}
              {result.source_pages.length > 0 && (
                <Chip
                  size="small"
                  label={`Page ${result.source_pages.join(", ")}`}
                  variant="outlined"
                  sx={{
                    height: 22,
                    "& .MuiChip-label": { fontSize: "0.7rem" },
                    color: theme.palette.secondary.main,
                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                  }}
                />
              )}
            </Box>

            {result.explanation && (
              <>
                <Button
                  size="small"
                  onClick={() => setOpen((v) => !v)}
                  endIcon={open ? <CollapseIcon sx={{ fontSize: 16 }} /> : <ExpandIcon sx={{ fontSize: 16 }} />}
                  sx={{ mt: 0.5, fontSize: "0.75rem", p: 0, minWidth: 0, color: "text.secondary" }}
                >
                  {open ? "Hide" : "View"} explanation
                </Button>
                <Collapse in={open}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      borderRadius: 2,
                      background: alpha(theme.palette.background.default, 0.6),
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {result.explanation}
                    </Typography>
                  </Box>
                </Collapse>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [submitQuiz, { data: mutationData, isLoading }] = useSubmitQuizMutation();
  const [localResult, setLocalResult] = useState<QuizSubmitResponse | null>(state?.result ?? null);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const result = state?.result ?? localResult ?? mutationData ?? null;

  useEffect(() => {
    if (state?.result) return;

    if (!state?.quizId || !state?.answers) {
      navigate("/documents");
      return;
    }

    if (submittedRef.current) return;
    submittedRef.current = true;

    submitQuiz({
      quizId: state.quizId,
      body: { answers: state.answers },
    })
      .unwrap()
      .then((res) => {
        setLocalResult(res);
      })
      .catch((err: any) => {
        const detail =
          err?.data?.detail ||
          err?.data?.message ||
          "Failed to grade the quiz. Please try again.";
        setError(typeof detail === "string" ? detail : JSON.stringify(detail));
      });
  }, [state, submitQuiz, navigate]);

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto", textAlign: "center", mt: 6 }}>
        <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          {state?.quiz?.document_id && (
            <Button
              variant="outlined"
              startIcon={<RetryIcon />}
              onClick={() => navigate(`/quiz/${state.quiz.document_id}`)}
            >
              Take new quiz
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/documents")}
          >
            Return to Documents
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading || !result) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Grading your quiz...</Typography>
      </Box>
    );
  }

  const scoreLabel =
    result.percentage >= 80
      ? "Outstanding!"
      : result.percentage >= 60
      ? "Good job!"
      : result.percentage >= 40
      ? "Keep practicing."
      : "Needs more review.";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: "auto" }}>
      {/* Score card */}
      <Card sx={{ mb: 3, textAlign: "center" }}>
        <CardContent sx={{ p: 4 }}>
          <ScoreRing percentage={result.percentage} />
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
            {scoreLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You scored {result.score} out of {result.max_score} questions correctly.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`${result.score}/${result.max_score} correct`}
              color={result.percentage >= 70 ? "success" : "error"}
            />
            <Chip
              label={`${(result.percentage ?? 0).toFixed(0)}% accuracy`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          component={Link}
          to="/dashboard"
          sx={{ flex: 1 }}
        >
          Dashboard
        </Button>
        <Button
          variant="contained"
          startIcon={<RetryIcon />}
          onClick={() => navigate(-2)}
          sx={{ flex: 1 }}
        >
          New quiz
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Review */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Answer review
      </Typography>
      {result.results.map((r, i) => (
        <ReviewCard
          key={r.question_index}
          result={r}
          question={state!.quiz.questions[r.question_index]}
          index={i}
        />
      ))}
    </Box>
  );
}
