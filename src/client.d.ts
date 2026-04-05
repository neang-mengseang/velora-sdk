import type { ClientOptions as _ClientOptions, FetchLike, Job, JobCreatePayload, JobUpdatePayload, JobListParams, JobListResponse, JobRunListResponse, Usage, Plan, CreateJobResponse, SimpleResponse, RegenerateWebhookSecretResponse, WebhookTriggerResponse } from './types';
export type ClientOptions = _ClientOptions;
export declare class VeloraClient {
    baseUrl: string;
    apiKey?: string;
    fetch: FetchLike;
    constructor(opts?: ClientOptions);
    private request;
    listJobs(params?: JobListParams): Promise<JobListResponse>;
    getJob(id: string): Promise<Job>;
    createJob(payload: JobCreatePayload): Promise<CreateJobResponse>;
    updateJob(id: string, payload: JobUpdatePayload): Promise<SimpleResponse>;
    deleteJob(id: string): Promise<SimpleResponse>;
    triggerJob(id: string): Promise<SimpleResponse>;
    enqueueJob(id: string): Promise<SimpleResponse>;
    regenerateWebhookSecret(id: string): Promise<RegenerateWebhookSecretResponse>;
    pauseJob(id: string): Promise<SimpleResponse>;
    resumeJob(id: string): Promise<SimpleResponse>;
    listJobRuns(id: string, params?: {
        limit?: number;
        offset?: number;
    }): Promise<JobRunListResponse>;
    getUsage(): Promise<Usage>;
    getPlan(): Promise<Plan>;
    /**
     * Trigger a public webhook for the given job id.
     * This helper does a POST to `/api/v1/webhooks/:id` without adding Authorization.
     * Provide either `token` (X-Webhook-Token) or `signature` (X-Hub-Signature-256) if needed.
     */
    triggerWebhook(id: string, body?: any, opts?: {
        token?: string;
        signature?: string;
        headers?: Record<string, string>;
    }): Promise<WebhookTriggerResponse>;
}
