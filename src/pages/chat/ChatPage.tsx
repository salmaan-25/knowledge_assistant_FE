import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Paper,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Send as SendIcon,
  ArrowBack as BackIcon,
  Description as DocIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useListDocumentsQuery,
  useChatMutation,
} from "../../store/api/apiSlice";
import type { SourceReference } from "../../types/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceReference[];
  timestamp: Date;
}

function SourcePill({ source }: { source: SourceReference }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Chip
        size="small"
        label={`Page ${source.page_number ?? "?"}`}
        onClick={() => setOpen((v) => !v)}
        sx={{
          height: 20,
          fontSize: "0.7rem",
          cursor: "pointer",
          background: alpha(theme.palette.secondary.main, 0.12),
          color: theme.palette.secondary.main,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          "& .MuiChip-label": { px: 1 },
          "&:hover": { background: alpha(theme.palette.secondary.main, 0.2) },
        }}
      />
      {open && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            zIndex: 100,
            maxWidth: 280,
            p: 1.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
          >
            Relevance: {((source.relevance_score ?? 0) * 100).toFixed(0)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            "{source.text_excerpt.slice(0, 180)}
            {source.text_excerpt.length > 180 ? "..." : ""}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const theme = useTheme();
  const isUser = msg.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "88%", md: "75%" },
          background: isUser
            ? "linear-gradient(135deg, #7C5CFC 0%, #9D82FD 100%)"
            : theme.palette.mode === "dark"
            ? alpha("#1E2235", 0.9)
            : "#fff",
          color: isUser ? "#fff" : "text.primary",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          p: 2,
          boxShadow: isUser
            ? "0 4px 20px rgba(124,92,252,0.25)"
            : theme.palette.mode === "dark"
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          border: isUser
            ? "none"
            : `1px solid ${theme.palette.divider}`,
        }}
      >
        {isUser ? (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {msg.content}
          </Typography>
        ) : (
          <Box
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.65,
              "& p": { my: 0.5 },
              "& p:first-of-type": { mt: 0 },
              "& p:last-of-type": { mb: 0 },
              "& ul, & ol": { pl: 2.5, my: 0.5 },
              "& li": { mb: 0.25 },
              "& code": {
                background: alpha(theme.palette.primary.main, 0.1),
                px: 0.5,
                py: 0.2,
                borderRadius: 1,
                fontSize: "0.8rem",
                fontFamily: "monospace",
              },
              "& pre": {
                background: alpha("#000", 0.2),
                p: 1.5,
                borderRadius: 2,
                overflowX: "auto",
                my: 1,
              },
              "& pre code": { background: "none", p: 0 },
              "& blockquote": {
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                pl: 1.5,
                ml: 0,
                color: "text.secondary",
              },
              "& strong": { fontWeight: 600 },
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 1,
                fontSize: "0.8rem",
              },
              "& th, & td": {
                border: `1px solid ${theme.palette.divider}`,
                p: 0.75,
              },
              "& th": { background: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </Box>
        )}

        {/* Source chips */}
        {msg.sources && msg.sources.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: `1px solid ${
                isUser
                  ? "rgba(255,255,255,0.2)"
                  : theme.palette.divider
              }`,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isUser ? "rgba(255,255,255,0.7)" : "text.secondary",
                fontSize: "0.68rem",
              }}
            >
              Sources:
            </Typography>
            {msg.sources.map((s, idx) => (
              <SourcePill key={s.chunk_id || idx} source={s} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function ChatPage() {
  const { documentId: paramDocId } = useParams<{ documentId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedDocId, setSelectedDocId] = useState(paramDocId || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chat, { isLoading: sending }] = useChatMutation();
  const { data: docsData, isLoading: docsLoading } = useListDocumentsQuery({});

  const readyDocs =
    docsData?.documents.filter((d) => d.status === "ready") ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [prevParamId, setPrevParamId] = useState(paramDocId);
  if (paramDocId && paramDocId !== prevParamId) {
    setPrevParamId(paramDocId);
    setSelectedDocId(paramDocId);
  }

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selectedDocId || sending) return;
    const text = input.trim();
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await chat({
        document_id: selectedDocId,
        message: text,
      }).unwrap();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please ensure the backend is running and try again.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [input, selectedDocId, sending, chat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedDoc = readyDocs.find((d) => d.id === selectedDocId);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 110px)",
        maxWidth: 900,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{ color: "text.secondary" }}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Chat
        </Typography>

        {/* Document selector */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select document</InputLabel>
          <Select
            value={selectedDocId}
            label="Select document"
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setMessages([]);
            }}
          >
            {docsLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : readyDocs.length === 0 ? (
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <DocIcon sx={{ fontSize: 56, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Select a document to start chatting
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a ready document from the dropdown above.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Messages area */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              px: 1,
              py: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.length === 0 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #7C5CFC, #22D3EE)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    opacity: 0.8,
                  }}
                >
                  <DocIcon sx={{ color: "#fff", fontSize: 32 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedDoc?.original_filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ask any question about this document. The AI will answer based
                  on the content.
                </Typography>
              </Box>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {sending && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input bar */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexShrink: 0,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(12px)",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              p: 1,
              alignItems: "flex-end",
            }}
          >
            <TextField
              multiline
              maxRows={4}
              fullWidth
              placeholder="Ask a question about this document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="standard"
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                "& .MuiInput-root": { px: 1, py: 0.5 },
                "& textarea": { fontSize: "0.9rem" },
              }}
            />
            <Tooltip title="Send (Enter)">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  sx={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #7C5CFC, #22D3EE)"
                      : undefined,
                    color: input.trim() ? "#fff !important" : undefined,
                    "&:disabled": { opacity: 0.4 },
                    borderRadius: 2,
                    width: 38,
                    height: 38,
                    transition: "all 0.2s ease",
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}
