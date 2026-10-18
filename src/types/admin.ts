export type UserRole = "user" | "admin";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role: UserRole;
  custom_daily_token_limit: number | null;
  tokens_used_today: number;
  queries_today: number;
  total_documents: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface DailyUsageStat {
  usage_date: string;
  total_tokens: number;
  total_queries: number;
  active_users: number;
}

export interface PlatformStats {
  total_users: number;
  admin_users: number;
  basic_users: number;
  active_users: number;
  inactive_users: number;
  tokens_consumed_today: number;
  queries_today: number;
  active_users_today: number;
  total_documents: number;
  daily_usage: DailyUsageStat[];
}

export interface PatchRoleRequest {
  role: UserRole;
}

export interface PatchStatusRequest {
  is_active: boolean;
}

export interface PatchLimitRequest {
  custom_daily_token_limit: number | null;
}

export interface AdminUserQueryParams {
  page?: number;
  page_size?: number;
  email_filter?: string;
  role_filter?: UserRole;
}
