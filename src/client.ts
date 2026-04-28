import type {
  ClientOptions,
  FetchLike,
  Job,
  JobCreatePayload,
  JobUpdatePayload,
  JobListParams,
  JobListResponse,
  JobBulkGetPayload,
  JobBulkGetResponse,
  JobBatchResumePayload,
  JobBatchResumeResponse,
  JobBatchCreatePayload,
  JobBatchCreateResponse,
  JobBatchUpdatePayload,
  JobBatchUpdateResponse,
  JobBatchDeletePayload,
  JobBatchDeleteResponse,
  JobRunListResponse,
  Usage,
  Plan,
  ApiErrorBody,
  CreateJobResponse,
  SimpleResponse,
  RegenerateWebhookSecretResponse,
  WebhookTriggerResponse,
} from './types';
import { VeloraError } from './types';

export { VeloraError } from './types';

export const DEFAULT_BASE_URL = 'https://api.velora.dev';

function buildUrl(base: string, path: string) {
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

export class VeloraClient {
  baseUrl: string;
  apiKey?: string;
  fetch: FetchLike;

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? (typeof globalThis !== 'undefined' ? (globalThis as any).VELORA_API_URL : undefined) ?? DEFAULT_BASE_URL;
    this.apiKey = opts.apiKey;
    this.fetch = opts.fetch || (typeof globalThis !== 'undefined' ? (globalThis as any).fetch : undefined);
    if (!this.fetch) throw new Error('No fetch available. Pass a fetch implementation via options.fetch in Node.');
  }

  private async request(path: string, init: RequestInit = {}) {
    const url = buildUrl(this.baseUrl, path);
    const headers = new Headers(init.headers || {} as any);
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (this.apiKey) headers.set('Authorization', `Bearer ${this.apiKey}`);

    const res = await this.fetch(url, { ...init, headers });
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!res.ok) {
      throw new VeloraError(res.status, typeof body === 'object' ? body as ApiErrorBody : { error: String(body) });
    }
    return body;
  }

  // Jobs
  async listJobs(params?: JobListParams): Promise<JobListResponse> {
    const qp = new URLSearchParams();
    if (params?.status) qp.set('status', params.status);
    if (params?.folder_path) qp.set('folder_path', params.folder_path);
    if (params?.limit) qp.set('limit', String(params.limit));
    if (params?.offset) qp.set('offset', String(params.offset));
    const path = `/api/v1/jobs${qp.toString() ? '?' + qp.toString() : ''}`;
    return this.request(path, { method: 'GET' });
  }

  async getJob(id: string): Promise<Job> { return this.request(`/api/v1/jobs/${id}`, { method: 'GET' }); }

  async bulkGetJobs(payload: JobBulkGetPayload): Promise<JobBulkGetResponse> {
    return this.request('/api/v1/jobs/bulk', { method: 'POST', body: JSON.stringify(payload) });
  }
  async createJob(payload: JobCreatePayload): Promise<CreateJobResponse> { return this.request('/api/v1/jobs', { method: 'POST', body: JSON.stringify(payload) }); }
  async updateJob(id: string, payload: JobUpdatePayload): Promise<SimpleResponse> { return this.request(`/api/v1/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); }
  async deleteJob(id: string): Promise<SimpleResponse> { return this.request(`/api/v1/jobs/${id}`, { method: 'DELETE' }); }

  async triggerJob(id: string): Promise<SimpleResponse> { return this.request(`/api/v1/jobs/${id}/trigger`, { method: 'POST' }); }
  async regenerateWebhookSecret(id: string): Promise<RegenerateWebhookSecretResponse> { return this.request(`/api/v1/jobs/${id}/regenerate-webhook-secret`, { method: 'POST' }); }
  async pauseJob(id: string): Promise<SimpleResponse> { return this.request(`/api/v1/jobs/${id}/pause`, { method: 'POST' }); }
  async resumeJob(id: string): Promise<SimpleResponse> { return this.request(`/api/v1/jobs/${id}/resume`, { method: 'POST' }); }
  async batchResumeJobs(payload: JobBatchResumePayload): Promise<JobBatchResumeResponse> {
    return this.request('/api/v1/jobs/resume/batch', { method: 'POST', body: JSON.stringify(payload) });
  }
  async batchCreateJobs(payload: JobBatchCreatePayload): Promise<JobBatchCreateResponse> {
    return this.request('/api/v1/jobs/batch', { method: 'POST', body: JSON.stringify(payload) });
  }
  async batchUpdateJobs(payload: JobBatchUpdatePayload): Promise<JobBatchUpdateResponse> {
    return this.request('/api/v1/jobs/batch', { method: 'PATCH', body: JSON.stringify(payload) });
  }
  async batchDeleteJobs(payload: JobBatchDeletePayload): Promise<JobBatchDeleteResponse> {
    return this.request('/api/v1/jobs/batch', { method: 'DELETE', body: JSON.stringify(payload) });
  }

  async listJobRuns(id: string, params?: { limit?: number; offset?: number }): Promise<JobRunListResponse> {
    const qp = new URLSearchParams();
    if (params?.limit) qp.set('limit', String(params.limit));
    if (params?.offset) qp.set('offset', String(params.offset));
    const path = `/api/v1/jobs/${id}/runs${qp.toString() ? '?' + qp.toString() : ''}`;
    return this.request(path, { method: 'GET' });
  }
  async getUsage(): Promise<Usage> { return this.request('/api/v1/usage', { method: 'GET' }); }
  async getPlan(): Promise<Plan> { return this.request('/api/v1/plan', { method: 'GET' }); }

  /**
   * Trigger a public webhook for the given job id.
   * This helper does a POST to `/api/v1/webhooks/:id` without adding Authorization.
   * Provide either `token` (X-Webhook-Token) or `signature` (X-Hub-Signature-256) if needed.
   */
  async triggerWebhook(id: string, body?: any, opts?: { token?: string; signature?: string; headers?: Record<string,string> }): Promise<WebhookTriggerResponse> {
    const url = buildUrl(this.baseUrl, `/api/v1/webhooks/${id}`);
    const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(opts?.headers || {}) };
    if (opts?.token) headers['X-Webhook-Token'] = opts.token;
    if (opts?.signature) headers['X-Hub-Signature-256'] = opts.signature;
    const res = await this.fetch(url, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    if (!res.ok) {
      throw new VeloraError(res.status, typeof data === 'object' ? data as ApiErrorBody : { error: String(data) });
    }
    return data;
  }
}
