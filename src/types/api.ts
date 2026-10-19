// ==========================================
// Authentication Types
// ==========================================
export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// ==========================================
// Document Types
// ==========================================
export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  page_count: number;
  total_chunks: number;
  status: DocumentStatus;
  message: string;
}

export interface DocumentMetadata {
  id: string;
  owner_id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  page_count: number | null;
  total_chunks: number | null;
  status: DocumentStatus;
  error_message: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: DocumentMetadata[];
  total: number;
}

export interface SummaryRequest {
  section_hint?: string;
  max_length?: number;
}

export interface SummaryResponse {
  document_id: string;
  summary: string;
  source_pages: number[];
  chunk_count: number;
}

// ==========================================
// Chat & RAG Types
// ==========================================
export interface SourceReference {
  chunk_id: string;
  page_number: number | null;
  text_excerpt: string;
  relevance_score: number;
}

export interface ChatRequest {
  document_id: string;
  message: string;
}

export interface ChatResponse {
  document_id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
}

export interface ChatMessageItem {
  id: string;
  document_id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceReference[];
  has_sufficient_context: boolean;
  created_at: string;
}

export interface ChatHistoryResponse {
  document_id: string;
  messages: ChatMessageItem[];
  total: number;
}

export interface ClearChatResponse {
  document_id: string;
  cleared_count: number;
  detail: string;
}

// ==========================================
// Quiz & Testing Types
// ==========================================
export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple_choice" | "true_false";

export interface QuizQuestionPublic {
  question_index: number;
  question_type: QuestionType;
  question_text: string;
  options: string[];
}

export interface QuizGenerateRequest {
  document_id: string;
  question_count: number;
  difficulty: QuizDifficulty;
  topic_filter?: string | null;
}

export interface QuizGenerateResponse {
  quiz_id: string;
  document_id: string;
  difficulty: QuizDifficulty;
  question_count: number;
  topic_filter: string | null;
  questions: QuizQuestionPublic[];
}

export interface SubmittedAnswerItem {
  question_index: number;
  answer?: string;
  selected_option?: string;
}

export interface QuizSubmitRequest {
  answers: SubmittedAnswerItem[];
}

export interface QuestionGradingResult {
  question_index: number;
  submitted_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string | null;
  source_pages: number[];
}

export interface QuizSubmitResponse {
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  submitted_at: string;
  results: QuestionGradingResult[];
}

// ==========================================
// Learning Analytics Types
// ==========================================
export interface OverallProgress {
  user_id?: string;
  total_quiz_attempts?: number;
  average_score_percentage?: number;
  topics_tracked?: number;
  weak_topics?: TopicAccuracy[];
  total_quizzes_taken?: number;
  total_questions_answered?: number;
  total_correct_answers?: number;
  overall_accuracy_percentage?: number;
  documents_quizzed?: number;
}

export interface TopicAccuracy {
  topic: string;
  attempts: number;
  correct: number;
  accuracy_percentage: number;
  last_attempted_at: string | null;
}

export interface QuizHistoryItem {
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  difficulty: string;
  submitted_at: string | null;
}

export interface DocumentProgressResponse {
  document_id: string;
  total_quiz_attempts?: number;
  total_attempts?: number;
  average_score_percentage?: number;
  quiz_history?: QuizHistoryItem[];
  topic_performance?: TopicAccuracy[];
  topic_breakdown?: TopicAccuracy[];
}

export interface WeakTopicsResponse {
  document_id: string;
  weak_topics: TopicAccuracy[];
  recommendation: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}
