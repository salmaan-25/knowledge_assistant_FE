import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { storage } from "../../lib/storage";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  DocumentListResponse,
  DocumentMetadata,
  DocumentUploadResponse,
  SummaryRequest,
  SummaryResponse,
  ChatRequest,
  ChatResponse,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  OverallProgress,
  DocumentProgressResponse,
  WeakTopicsResponse,
  HealthResponse,
  ChatHistoryResponse,
  ClearChatResponse,
} from "../../types/api";
import type {
  PlatformStats,
  AdminUserListResponse,
  AdminUser,
  AdminUserQueryParams,
} from "../../types/admin";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = storage.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Document", "Progress", "Quiz", "User", "AdminUsers", "AdminStats", "Chat"],
  endpoints: (builder) => ({
    // ── Auth ───────────────────────────────────────────────────────────
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => {
        const params = new URLSearchParams();
        params.append("username", credentials.email);
        params.append("password", credentials.password);
        return {
          url: "/auth/login",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        };
      },
    }),
    register: builder.mutation<UserProfile, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<UserProfile, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // ── Documents ──────────────────────────────────────────────────────
    listDocuments: builder.query<
      DocumentListResponse,
      { skip?: number; limit?: number }
    >({
      query: ({ skip = 0, limit = 50 } = {}) =>
        `/documents?skip=${skip}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.documents.map((d) => ({
                type: "Document" as const,
                id: d.id,
              })),
              { type: "Document", id: "LIST" },
            ]
          : [{ type: "Document", id: "LIST" }],
    }),
    getDocument: builder.query<DocumentMetadata, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Document", id }],
    }),
    uploadDocument: builder.mutation<DocumentUploadResponse, FormData>({
      query: (formData) => ({
        url: "/documents/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Document", id },
        { type: "Document", id: "LIST" },
        { type: "Progress", id: "OVERALL" },
      ],
    }),
    generateSummary: builder.mutation<
      SummaryResponse,
      { documentId: string; body: SummaryRequest }
    >({
      query: ({ documentId, body }) => ({
        url: `/documents/${documentId}/summary`,
        method: "POST",
        body,
      }),
    }),

    // ── Chat ───────────────────────────────────────────────────────────
    chat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { document_id }) => [
        { type: "Chat", id: document_id },
      ],
    }),
    getChatHistory: builder.query<
      ChatHistoryResponse,
      string | { documentId: string; limit?: number }
    >({
      query: (arg) => {
        const documentId = typeof arg === "string" ? arg : arg.documentId;
        const limit = typeof arg === "string" ? 100 : (arg.limit ?? 100);
        return `/chat/${documentId}/history?limit=${limit}`;
      },
      providesTags: (_result, _error, arg) => {
        const documentId = typeof arg === "string" ? arg : arg.documentId;
        return [{ type: "Chat", id: documentId }];
      },
    }),
    clearChatHistory: builder.mutation<ClearChatResponse, string>({
      query: (documentId) => ({
        url: `/chat/${documentId}/history`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, documentId) => [
        { type: "Chat", id: documentId },
      ],
    }),

    // ── Quizzes ────────────────────────────────────────────────────────
    generateQuiz: builder.mutation<QuizGenerateResponse, QuizGenerateRequest>({
      query: (body) => ({
        url: "/quizzes/generate",
        method: "POST",
        body,
      }),
    }),
    getQuiz: builder.query<QuizGenerateResponse, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Quiz", id }],
    }),
    submitQuiz: builder.mutation<
      QuizSubmitResponse,
      { quizId: string; body: QuizSubmitRequest }
    >({
      query: ({ quizId, body }) => ({
        url: `/quizzes/${quizId}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Progress", id: "OVERALL" }],
    }),

    // ── Progress ───────────────────────────────────────────────────────
    getOverallProgress: builder.query<OverallProgress, void>({
      query: () => "/progress",
      providesTags: [{ type: "Progress", id: "OVERALL" }],
    }),
    getDocumentProgress: builder.query<DocumentProgressResponse, string>({
      query: (id) => `/progress/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Progress", id }],
    }),
    getWeakTopics: builder.query<WeakTopicsResponse, string>({
      query: (id) => `/progress/${id}/weak`,
      providesTags: (_r, _e, id) => [{ type: "Progress", id: `weak-${id}` }],
    }),

    // ── Health ─────────────────────────────────────────────────────────
    healthCheck: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),

    // ── Admin ──────────────────────────────────────────────────────────
    adminGetStats: builder.query<PlatformStats, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),
    adminGetUsers: builder.query<AdminUserListResponse, AdminUserQueryParams>({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["AdminUsers"],
    }),
    adminGetUser: builder.query<AdminUser, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: (_r, _e, id) => [{ type: "AdminUsers", id }],
    }),
    adminUpdateRole: builder.mutation<
      AdminUser,
      { userId: string; role: string }
    >({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    adminUpdateStatus: builder.mutation<
      AdminUser,
      { userId: string; is_active: boolean }
    >({
      query: ({ userId, is_active }) => ({
        url: `/admin/users/${userId}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    adminUpdateLimit: builder.mutation<
      AdminUser,
      { userId: string; custom_daily_token_limit: number | null }
    >({
      query: ({ userId, custom_daily_token_limit }) => ({
        url: `/admin/users/${userId}/limit`,
        method: "PATCH",
        body: { custom_daily_token_limit },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useListDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGenerateSummaryMutation,
  useChatMutation,
  useGetChatHistoryQuery,
  useClearChatHistoryMutation,
  useGenerateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizMutation,
  useGetOverallProgressQuery,
  useGetDocumentProgressQuery,
  useGetWeakTopicsQuery,
  useHealthCheckQuery,
  useAdminGetStatsQuery,
  useAdminGetUsersQuery,
  useAdminGetUserQuery,
  useAdminUpdateRoleMutation,
  useAdminUpdateStatusMutation,
  useAdminUpdateLimitMutation,
} = api;
