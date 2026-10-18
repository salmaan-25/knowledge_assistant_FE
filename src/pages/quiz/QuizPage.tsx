import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
} from "@mui/icons-material";
import {
  useGetDocumentQuery,
  useGenerateQuizMutation,
  useSubmitQuizMutation,
} from "../../store/api/apiSlice";
import type { QuizDifficulty, QuizGenerateResponse } from "../../types/api";

// ── Active quiz session ──────────────────────────────────────────────────────
function QuizSession({
  quiz,
  onSubmit,
  submitting,
  error,
}: {
  quiz: QuizGenerateResponse;
  onSubmit: (answers: Record<number, string>) => void;
  submitting: boolean;
  error?: string | null;
}) {
  const theme = useTheme();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const q = quiz.questions[current];
  const totalAnswered = Object.keys(answers).length;

  const getOptionLetter = (option: string) => option.split(".")[0].trim();
  const canSubmit = totalAnswered === quiz.questions.length;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Progress */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Question {current + 1} of {quiz.questions.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalAnswered} answered
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, mb: 3, flexWrap: "wrap" }}>
        {quiz.questions.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrent(i)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 600,
              background:
                i === current
                  ? "linear-gradient(135deg, #7C5CFC, #22D3EE)"
                  : answers[i]
                  ? alpha(theme.palette.success.main, 0.15)
                  : alpha(theme.palette.divider, 1),
              color:
                i === current
                  ? "#fff"
                  : answers[i]
                  ? theme.palette.success.main
                  : theme.palette.text.secondary,
              border: i === current ? "none" : `1px solid ${theme.palette.divider}`,
              transition: "all 0.15s",
            }}
          >
            {i + 1}
          </Box>
        ))}
      </Box>

      {/* Question card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Chip
              size="small"
              label={q.question_type === "multiple_choice" ? "Multiple choice" : "True / False"}
              variant="outlined"
              sx={{ fontSize: "0.72rem" }}
            />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
            {q.question_text}
          </Typography>
        </CardContent>
      </Card>

      {/* Options */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        {q.options.map((option) => {
          const letter = getOptionLetter(option);
          const isSelected = answers[q.question_index] === letter;
          return (
            <Box
              key={option}
              onClick={() =>
                setAnswers((prev) => ({ ...prev, [q.question_index]: letter }))
              }
              sx={{
                p: 2,
                borderRadius: 2,
                border: `2px solid ${
                  isSelected
                    ? theme.palette.primary.main
                    : theme.palette.divider
                }`,
                background: isSelected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : theme.palette.background.paper,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isSelected
                    ? "linear-gradient(135deg, #7C5CFC, #22D3EE)"
                    : alpha(theme.palette.divider, 1),
                  color: isSelected ? "#fff" : theme.palette.text.secondary,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {letter}
              </Box>
              <Typography variant="body2">
                {option.includes(".") ? option.split(".").slice(1).join(".").trim() : option}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          variant="outlined"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </Button>

        {current < quiz.questions.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={() => setCurrent((c) => c + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            disabled={!canSubmit || submitting}
            onClick={() => onSubmit(answers)}
          >
            {submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              `Submit quiz (${totalAnswered}/${quiz.questions.length})`
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function QuizPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: doc, isLoading: docLoading } = useGetDocumentQuery(
    documentId!,
    { skip: !documentId }
  );
  const [generateQuiz, { isLoading: generating }] = useGenerateQuizMutation();
  const [submitQuiz] = useSubmitQuizMutation();
  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quiz config state
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [topicFilter, setTopicFilter] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = async () => {
    if (!documentId) return;
    setError(null);
    try {
      const res = await generateQuiz({
        document_id: documentId,
        question_count: questionCount,
        difficulty,
        topic_filter: topicFilter.trim() || null,
      }).unwrap();
      setQuiz(res);
      setQuizId(res.quiz_id);
    } catch {
      setError("Failed to generate quiz. Please try again.");
    }
  };

  const handleSubmit = async (answers: Record<number, string>) => {
    if (!quizId || !quiz) return;
    setSubmitting(true);
    setError(null);
    const answerArray = Object.entries(answers).map(([idx, opt]) => ({
      question_index: parseInt(idx),
      answer: opt,
      selected_option: opt,
    }));
    try {
      const res = await submitQuiz({
        quizId,
        body: { answers: answerArray },
      }).unwrap();
      navigate(`/quiz/${quizId}/result`, {
        state: { quizId, answers: answerArray, quiz, result: res },
      });
    } catch (err: any) {
      setSubmitting(false);
      const detail =
        err?.data?.detail ||
        err?.data?.message ||
        "Failed to submit quiz. Please try again.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  };

  if (docLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (quiz) {
    return (
      <QuizSession
        quiz={quiz}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    );
  }

  const difficultyColors: Record<QuizDifficulty, string> = {
    easy: theme.palette.success.main,
    medium: theme.palette.warning.main,
    hard: theme.palette.error.main,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: "auto" }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Generate Quiz
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {doc?.original_filename || "Selected document"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Difficulty */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Difficulty
          </Typography>
          <ToggleButtonGroup
            value={difficulty}
            exclusive
            onChange={(_, v) => v && setDifficulty(v)}
            fullWidth
            sx={{ mb: 3 }}
          >
            {(["easy", "medium", "hard"] as QuizDifficulty[]).map((d) => (
              <ToggleButton
                key={d}
                value={d}
                sx={{
                  textTransform: "capitalize",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  "&.Mui-selected": {
                    color: difficultyColors[d],
                    background: alpha(difficultyColors[d], 0.1),
                    borderColor: difficultyColors[d],
                  },
                }}
              >
                {d}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Question count */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Number of questions:{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {questionCount}
            </Box>
          </Typography>
          <Slider
            value={questionCount}
            onChange={(_, v) => setQuestionCount(v as number)}
            min={1}
            max={20}
            step={1}
            marks={[
              { value: 1, label: "1" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 15, label: "15" },
              { value: 20, label: "20" },
            ]}
            sx={{
              mb: 3,
              "& .MuiSlider-track": {
                background: "linear-gradient(90deg, #7C5CFC, #22D3EE)",
                border: "none",
              },
              "& .MuiSlider-thumb": {
                background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
              },
            }}
          />

          {/* Topic filter */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Topic focus (optional)
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. Pricing strategies, Distribution channels"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={
              generating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <QuizIcon />
              )
            }
            onClick={handleGenerate}
            disabled={generating}
            sx={{ py: 1.25 }}
          >
            {generating ? "Generating quiz..." : "Generate quiz"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
