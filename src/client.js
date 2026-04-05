function buildUrl(base, path) {
    return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
export class VeloraClient {
    constructor(opts = {}) {
        this.baseUrl = opts.baseUrl || 'https://api.velora.dev';
        this.apiKey = opts.apiKey;
        this.fetch = opts.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);
        if (!this.fetch)
            throw new Error('No fetch available. Pass a fetch implementation via options.fetch in Node.');
    }
    async request(path, init = {}) {
        const url = buildUrl(this.baseUrl, path);
        const headers = new Headers(init.headers || {});
        if (!headers.has('Content-Type') && !(init.body instanceof FormData))
            headers.set('Content-Type', 'application/json');
        if (this.apiKey)
            headers.set('Authorization', `Bearer ${this.apiKey}`);
        const res = await this.fetch(url, { ...init, headers });
        const text = await res.text();
        let body = null;
        try {
            body = text ? JSON.parse(text) : null;
        }
        catch {
            body = text;
        }
        if (!res.ok) {
            const err = new Error('HTTP error: ' + res.status);
            err.status = res.status;
            err.body = body;
            throw err;
        }
        return body;
    }
    // Jobs
    async listJobs(params) {
        const qp = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            qp.set('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.limit)
            qp.set('limit', String(params.limit));
        if (params === null || params === void 0 ? void 0 : params.offset)
            qp.set('offset', String(params.offset));
        const path = `/api/v1/jobs${qp.toString() ? '?' + qp.toString() : ''}`;
        return this.request(path, { method: 'GET' });
    }
    async getJob(id) { return this.request(`/api/v1/jobs/${id}`, { method: 'GET' }); }
    async createJob(payload) { return this.request('/api/v1/jobs', { method: 'POST', body: JSON.stringify(payload) }); }
    async updateJob(id, payload) { return this.request(`/api/v1/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); }
    async deleteJob(id) { return this.request(`/api/v1/jobs/${id}`, { method: 'DELETE' }); }
    async triggerJob(id) { return this.request(`/api/v1/jobs/${id}/trigger`, { method: 'POST' }); }
    async enqueueJob(id) { return this.request(`/api/v1/jobs/${id}/enqueue`, { method: 'POST' }); }
    async regenerateWebhookSecret(id) { return this.request(`/api/v1/jobs/${id}/regenerate-webhook-secret`, { method: 'POST' }); }
    async pauseJob(id) { return this.request(`/api/v1/jobs/${id}/pause`, { method: 'POST' }); }
    async resumeJob(id) { return this.request(`/api/v1/jobs/${id}/resume`, { method: 'POST' }); }
    async listJobRuns(id, params) {
        const qp = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.limit)
            qp.set('limit', String(params.limit));
        if (params === null || params === void 0 ? void 0 : params.offset)
            qp.set('offset', String(params.offset));
        const path = `/api/v1/jobs/${id}/runs${qp.toString() ? '?' + qp.toString() : ''}`;
        return this.request(path, { method: 'GET' });
    }
    async getUsage() { return this.request('/api/v1/usage', { method: 'GET' }); }
    async getPlan() { return this.request('/api/v1/plan', { method: 'GET' }); }
    /**
     * Trigger a public webhook for the given job id.
     * This helper does a POST to `/api/v1/webhooks/:id` without adding Authorization.
     * Provide either `token` (X-Webhook-Token) or `signature` (X-Hub-Signature-256) if needed.
     */
    async triggerWebhook(id, body, opts) {
        const url = buildUrl(this.baseUrl, `/api/v1/webhooks/${id}`);
        const headers = { 'Content-Type': 'application/json', ...((opts === null || opts === void 0 ? void 0 : opts.headers) || {}) };
        if (opts === null || opts === void 0 ? void 0 : opts.token)
            headers['X-Webhook-Token'] = opts.token;
        if (opts === null || opts === void 0 ? void 0 : opts.signature)
            headers['X-Hub-Signature-256'] = opts.signature;
        const res = await this.fetch(url, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
        const text = await res.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        }
        catch {
            data = text;
        }
        if (!res.ok) {
            const err = new Error('HTTP error: ' + res.status);
            err.status = res.status;
            err.body = data;
            throw err;
        }
        return data;
    }
}
