import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Skeleton,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Description as DocIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentQuery,
} from "../../store/api/apiSlice";
import type { DocumentMetadata } from "../../types/api";

// ── Polling component ────────────────────────────────────────────────────────
function PollingDoc({
  id,
  onReady,
}: {
  id: string;
  onReady: () => void;
}) {
  const { data } = useGetDocumentQuery(id, {
    pollingInterval: 2500,
  });
  useEffect(() => {
    if (data?.status === "ready" || data?.status === "failed") {
      onReady();
    }
  }, [data?.status, onReady]);
  return null;
}

// ── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: DocumentMetadata["status"] }) {
  const map = {
    ready: { label: "Ready", color: "success" as const, icon: <CheckIcon sx={{ fontSize: 13 }} /> },
    pending: { label: "Processing", color: "warning" as const, icon: <PendingIcon sx={{ fontSize: 13 }} /> },
    processing: { label: "Processing", color: "warning" as const, icon: <PendingIcon sx={{ fontSize: 13 }} /> },
    failed: { label: "Failed", color: "error" as const, icon: <ErrorIcon sx={{ fontSize: 13 }} /> },
  };
  const m = map[status] || map.pending;
  return (
    <Chip
      size="small"
      label={m.label}
      color={m.color}
      icon={m.icon}
      sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.72rem", px: 0.75 } }}
    />
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Upload dropzone ──────────────────────────────────────────────────────────
function UploadZone({
  onFile,
  uploading,
}: {
  onFile: (file: File) => void;
  uploading: boolean;
}) {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") onFile(file);
  };

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      sx={{
        border: `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 3,
        p: 4,
        textAlign: "center",
        cursor: uploading ? "default" : "pointer",
        background: dragging
          ? alpha(theme.palette.primary.main, 0.06)
          : "transparent",
        transition: "all 0.2s ease",
        "&:hover": uploading
          ? {}
          : {
              borderColor: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.04),
            },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {uploading ? (
        <Box>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Uploading and indexing...
          </Typography>
        </Box>
      ) : (
        <Box>
          <UploadIcon
            sx={{
              fontSize: 44,
              color: theme.palette.primary.main,
              mb: 1.5,
              opacity: 0.7,
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Drop a PDF here, or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PDF files up to 50 MB
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function DocumentsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useListDocumentsQuery({});
  const [uploadDoc, { isLoading: uploading }] = useUploadDocumentMutation();
  const [deleteDoc] = useDeleteDocumentMutation();
  const [pollingIds, setPollingIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DocumentMetadata | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadError(null);
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await uploadDoc(fd).unwrap();
        setPollingIds((prev) => [...prev, res.document_id]);
      } catch (err: unknown) {
        const e = err as { status?: number; data?: { detail?: string } };
        if (e.status === 413) setUploadError("File exceeds the 50 MB limit.");
        else if (e.status === 422)
          setUploadError("Only PDF files are supported.");
        else setUploadError("Upload failed. Please try again.");
      }
    },
    [uploadDoc]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDoc(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handlePollingDone = useCallback(
    (id: string) => {
      setPollingIds((prev) => prev.filter((x) => x !== id));
      refetch();
    },
    [refetch]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Invisible polling components */}
      {pollingIds.map((id) => (
        <PollingDoc
          key={id}
          id={id}
          onReady={() => handlePollingDone(id)}
        />
      ))}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.total ?? 0} document{data?.total !== 1 ? "s" : ""} in your library
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Upload zone */}
      <Box sx={{ mb: 3 }}>
        <UploadZone onFile={handleUpload} uploading={uploading} />
        {uploadError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {uploadError}
          </Typography>
        )}
      </Box>

      {/* Document list */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : data && data.documents.length > 0 ? (
        <Grid container spacing={2}>
          {data.documents.map((doc) => (
            <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                <CardContent
                  sx={{
                    p: 2.5,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Top */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 22 }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      {(doc.status === "pending" ||
                        doc.status === "processing") && (
                        <CircularProgress size={14} sx={{ mr: 0.5 }} />
                      )}
                      <StatusChip status={doc.status} />
                    </Box>
                  </Box>

                  {/* Name */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {doc.original_filename}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(doc.file_size_bytes)}
                    {doc.page_count != null ? ` · ${doc.page_count} pages` : ""}
                    {doc.total_chunks != null
                      ? ` · ${doc.total_chunks} chunks`
                      : ""}
                  </Typography>

                  <Box sx={{ flex: 1 }} />

                  {/* Actions */}
                  {doc.status === "ready" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ChatIcon sx={{ fontSize: 14 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${doc.id}`);
                        }}
                        sx={{ flex: 1, fontSize: "0.72rem", py: 0.5 }}
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
                        sx={{ flex: 1, fontSize: "0.72rem", py: 0.5 }}
                      >
                        Quiz
                      </Button>
                    </Box>
                  )}

                  {/* Delete */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Tooltip title="Delete document">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(doc);
                        }}
                        sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <DocIcon sx={{ fontSize: 56, opacity: 0.3, mb: 2 }} />
          <Typography variant="body1">
            No documents uploaded yet. Upload a PDF above to begin.
          </Typography>
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 400 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete document?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{deleteTarget?.original_filename}</strong> will be permanently
            removed including all quiz history and chat data. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
