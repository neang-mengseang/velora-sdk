export type FetchLike = typeof fetch;

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
  fetch?: FetchLike;
}

export interface Job {
  id: string;
  name?: string;
  target_url?: string;
  schedule_cron?: string | null;
  paused?: boolean;
  created_at?: string;
  updated_at?: string;
  // extend as needed
  [key: string]: any;
}

export interface JobCreatePayload {
  name?: string;
  description?: string;
  target_url: string;
  method?: string;
  schedule_cron: string;
  schedule_type?: string;
  timezone?: string;
  timeout_ms?: number;
  headers_json?: Record<string, string>;
  body_json?: unknown;
  retry_policy_json?: Record<string, unknown>;
  folder_path?: string;
  [key: string]: any;
}

export interface JobUpdatePayload {
  name?: string;
  target_url?: string;
  schedule_cron?: string | null;
  paused?: boolean;
  folder_path?: string;
  [key: string]: any;
}

export interface JobListParams {
  status?: string;
  folder_path?: string;
  limit?: number;
  offset?: number;
}

/** Server returns { jobs: Job[], total, limit, offset } */
export interface JobListResponse {
  jobs: Job[];
  total: number;
  limit: number;
  offset: number;
}

export interface JobBulkGetPayload {
  ids: string[];
}

/** Server returns { jobs: Job[], total } */
export interface JobBulkGetResponse {
  jobs: Job[];
  total: number;
}

export interface JobBatchResumePayload {
  ids: string[];
}

/** Server returns { jobs: Job[], total, resumed, skipped } */
export interface JobBatchResumeResponse {
  jobs: Job[];
  total: number;
  resumed: number;
  skipped: number;
}

export interface JobBatchCreatePayload {
  jobs: JobCreatePayload[];
}

/** Server returns { jobs: Job[], total, created, failed } */
export interface JobBatchCreateResponse {
  jobs: Job[];
  total: number;
  created: number;
  failed: number;
}

export interface JobBatchUpdatePayload {
  jobs: (JobUpdatePayload & { id: string })[];
}

/** Server returns { jobs: Job[], total, updated, failed } */
export interface JobBatchUpdateResponse {
  jobs: Job[];
  total: number;
  updated: number;
  failed: number;
}

export interface JobBatchDeletePayload {
  ids: string[];
}

/** Server returns { jobs: Job[], total, deleted, failed } */
export interface JobBatchDeleteResponse {
  jobs: Job[];
  total: number;
  deleted: number;
  failed: number;
}

export interface JobRun {
  id: string;
  job_id: string;
  status: string;
  created_at?: string;
  error_message?: string | null;
  response_body?: any;
  [key: string]: any;
}

/** Server returns { runs: JobRun[], total, limit, offset } */
export interface JobRunListResponse {
  runs: JobRun[];
  total: number;
  limit: number;
  offset: number;
}

/** Server returns { usage: {...}, limits: {...}, period: {...} } */
export interface UsageCounts {
  total_jobs: number;
  active_jobs: number;
  daily_runs: number;
  monthly_runs: number;
}

export interface UsageLimits {
  max_jobs: number | null;
  max_daily_runs: number | null;
  max_monthly_runs: number | null;
  min_interval_seconds: number | null;
}

export interface UsagePeriod {
  day_start: string;
  month_start: string;
}

export interface Usage {
  usage: UsageCounts;
  limits: UsageLimits;
  period: UsagePeriod;
}

export interface PlanDetails {
  id: string | null;
  slug: string;
  name: string;
  limits: Record<string, any> | null;
}

export interface PlanSubscription {
  id: string;
  plan_id: string;
  status: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

/** Server returns { subscription, plan } */
export interface Plan {
  subscription: PlanSubscription | null;
  plan: PlanDetails;
}

export interface ApiErrorBody {
  error?: string;
  msg?: string;
  [key: string]: any;
}

/** Thrown by VeloraClient on non-2xx responses */
export class VeloraError extends Error {
  status: number;
  body: ApiErrorBody | null;
  constructor(status: number, body: ApiErrorBody | null) {
    super(`Velora API error ${status}: ${body?.msg || body?.error || 'Unknown error'}`);
    this.name = 'VeloraError';
    this.status = status;
    this.body = body;
  }
}

// Common responses
export interface CreateJobResponse {
  id: string;
  owner_id?: string;
  api_key_id?: string;
  status?: string;
  msg?: string;
}

export interface SimpleResponse {
  id?: string;
  msg?: string;
}

export interface RegenerateWebhookSecretResponse {
  id: string;
  webhook_secret: string;
  msg?: string;
}

export interface WebhookTriggerResponse {
  id?: string;
  msg?: string;
}
