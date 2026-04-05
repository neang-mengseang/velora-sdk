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
    [key: string]: any;
}
export interface JobCreatePayload {
    name?: string;
    target_url: string;
    schedule_cron?: string | null;
    webhook_secret?: string | null;
    [key: string]: any;
}
export interface JobUpdatePayload {
    name?: string;
    target_url?: string;
    schedule_cron?: string | null;
    paused?: boolean;
    [key: string]: any;
}
export interface JobListParams {
    status?: string;
    limit?: number;
    offset?: number;
}
export interface Paginated<T> {
    data: T[];
    total?: number;
    limit?: number;
    offset?: number;
}
export type JobListResponse = Paginated<Job>;
export interface JobRun {
    id: string;
    job_id: string;
    status: string;
    created_at?: string;
    error_message?: string | null;
    response_body?: any;
}
export type JobRunListResponse = Paginated<JobRun>;
export interface Usage {
    calls: number;
    limit: number;
    period_start?: string;
    period_end?: string;
}
export interface Plan {
    name: string;
    limits?: Record<string, any>;
}
export interface ApiError {
    message?: string;
    code?: string;
    [key: string]: any;
}
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
