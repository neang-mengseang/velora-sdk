import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { VeloraClient, VeloraError } from '../src/client';
// Mock fetch function
const mockFetch = vi.fn();
describe('VeloraClient', () => {
    const originalFetch = globalThis.fetch;
    const originalVeloraUrl = globalThis.VELORA_API_URL;
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear global VELORA_API_URL to use default base URL in tests
        delete globalThis.VELORA_API_URL;
        delete globalThis.VELORA_URL;
        if (originalFetch)
            globalThis.fetch = originalFetch;
    });
    afterAll(() => {
        if (originalVeloraUrl)
            globalThis.VELORA_API_URL = originalVeloraUrl;
    });
    describe('constructor', () => {
        it('should create a client with default base URL', () => {
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            expect(client.baseUrl).toBe('https://velora-api.psalinks.com');
            expect(client.apiKey).toBe('test-key');
        });
        it('should create a client with custom base URL', () => {
            const client = new VeloraClient({
                apiKey: 'test-key',
                fetch: mockFetch,
                baseUrl: 'https://custom.api.com'
            });
            expect(client.baseUrl).toBe('https://custom.api.com');
        });
        it.skip('should throw error if no fetch available', () => {
            const originalFetch = globalThis.fetch;
            const originalVeloraUrl = globalThis.VELORA_API_URL;
            delete globalThis.fetch;
            delete globalThis.VELORA_API_URL;
            expect(() => new VeloraClient({ apiKey: 'test-key' })).toThrow('No fetch available')(globalThis).fetch = originalFetch;
            if (originalVeloraUrl)
                globalThis.VELORA_API_URL = originalVeloraUrl;
        });
    });
    describe('listJobs', () => {
        it('should list jobs with default parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ jobs: [], total: 0, limit: 20, offset: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.listJobs();
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Headers)
            }));
            expect(result).toEqual({ jobs: [], total: 0, limit: 20, offset: 0 });
        });
        it('should list jobs with status filter', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ jobs: [], total: 0, limit: 20, offset: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            await client.listJobs({ status: 'active' });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs?status=active', expect.objectContaining({ method: 'GET' }));
        });
        it.skip('should list jobs with folder_path filter', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ jobs: [], total: 0, limit: 20, offset: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            await client.listJobs({ folder_path: '/reports/' });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs?folder_path=%2Freports%2F', expect.objectContaining({ method: 'GET' }));
        });
        it('should handle API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: () => Promise.resolve(JSON.stringify({ error: 'invalid_api_key' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            await expect(client.listJobs()).rejects.toThrow(VeloraError);
        });
    });
    describe('getJob', () => {
        it('should get a single job by ID', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', name: 'Test Job', status: 'active' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.getJob('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1', expect.objectContaining({ method: 'GET' }));
            expect(result).toEqual({ id: 'job-1', name: 'Test Job', status: 'active' });
        });
        it('should handle 404 error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: () => Promise.resolve(JSON.stringify({ error: 'not_found', msg: 'Job not found' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            await expect(client.getJob('job-1')).rejects.toThrow(VeloraError);
        });
    });
    describe('createJob', () => {
        it('should create a new job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', status: 'active', msg: 'Job created' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.createJob({
                name: 'Test Job',
                target_url: 'https://example.com/hook',
                schedule_cron: '0 9 * * *'
            });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: 'Test Job', target_url: 'https://example.com/hook', schedule_cron: '0 9 * * *' })
            }));
            expect(result).toEqual({ id: 'job-1', status: 'active', msg: 'Job created' });
        });
    });
    describe('updateJob', () => {
        it('should update a job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Job updated' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.updateJob('job-1', { name: 'Updated Job' });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1', expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Job' })
            }));
            expect(result).toEqual({ id: 'job-1', msg: 'Job updated' });
        });
    });
    describe('deleteJob', () => {
        it('should delete a job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Job deleted' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.deleteJob('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1', expect.objectContaining({ method: 'DELETE' }));
            expect(result).toEqual({ id: 'job-1', msg: 'Job deleted' });
        });
    });
    describe('bulkGetJobs', () => {
        it.skip('should bulk fetch jobs by IDs', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ jobs: [], total: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.bulkGetJobs({ ids: ['job-1', 'job-2'] });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/bulk', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ ids: ['job-1', 'job-2'] })
            }));
            expect(result).toEqual({ jobs: [], total: 0 });
        });
        it.skip('should return empty result for empty IDs array', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ jobs: [], total: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.bulkGetJobs({ ids: [] });
            expect(result).toEqual({ jobs: [], total: 0 });
        });
        it.skip('should throw error for more than 100 IDs', async () => {
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            await expect(client.bulkGetJobs({ ids: Array(101).fill('job-1') })).rejects.toThrow('Cannot fetch more than 100 jobs at once');
        });
    });
    describe('pauseJob', () => {
        it('should pause a job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Job paused' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.pauseJob('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/pause', expect.objectContaining({ method: 'POST' }));
            expect(result).toEqual({ id: 'job-1', msg: 'Job paused' });
        });
    });
    describe('resumeJob', () => {
        it('should resume a paused job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Job resumed' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.resumeJob('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/resume', expect.objectContaining({ method: 'POST' }));
            expect(result).toEqual({ id: 'job-1', msg: 'Job resumed' });
        });
    });
    describe('triggerJob', () => {
        it('should trigger a job for immediate execution', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Job triggered' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.triggerJob('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/trigger', expect.objectContaining({ method: 'POST' }));
            expect(result).toEqual({ id: 'job-1', msg: 'Job triggered' });
        });
    });
    describe('regenerateWebhookSecret', () => {
        it('should regenerate webhook secret', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', webhook_secret: 'new-secret' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.regenerateWebhookSecret('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/regenerate-webhook-secret', expect.objectContaining({ method: 'POST' }));
            expect(result).toEqual({ id: 'job-1', webhook_secret: 'new-secret' });
        });
    });
    describe('listJobRuns', () => {
        it('should list job runs with default parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ runs: [], total: 0, limit: 20, offset: 0 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.listJobRuns('job-1');
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/runs', expect.objectContaining({ method: 'GET' }));
            expect(result).toEqual({ runs: [], total: 0, limit: 20, offset: 0 });
        });
        it('should list job runs with limit and offset', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ runs: [], total: 0, limit: 10, offset: 5 }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.listJobRuns('job-1', { limit: 10, offset: 5 });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/jobs/job-1/runs?limit=10&offset=5', expect.objectContaining({ method: 'GET' }));
            expect(result).toEqual({ runs: [], total: 0, limit: 10, offset: 5 });
        });
    });
    describe('getUsage', () => {
        it('should get usage information', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({
                    usage: { total_jobs: 10, active_jobs: 5 },
                    limits: { max_jobs: 100 },
                    period: { day_start: '2026-04-01' }
                }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.getUsage();
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/usage', expect.objectContaining({ method: 'GET' }));
            expect(result).toEqual({
                usage: { total_jobs: 10, active_jobs: 5 },
                limits: { max_jobs: 100 },
                period: { day_start: '2026-04-01' }
            });
        });
    });
    describe('getPlan', () => {
        it('should get plan information', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({
                    subscription: null,
                    plan: { id: 'plan-1', name: 'Free', slug: 'free', limits: null }
                }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.getPlan();
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/plan', expect.objectContaining({ method: 'GET' }));
            expect(result).toEqual({
                subscription: null,
                plan: { id: 'plan-1', name: 'Free', slug: 'free', limits: null }
            });
        });
    });
    describe('triggerWebhook', () => {
        it('should trigger a public webhook', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Webhook triggered' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.triggerWebhook('job-1', { event: 'ping' });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/webhooks/job-1', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ event: 'ping' })
            }));
            expect(result).toEqual({ id: 'job-1', msg: 'Webhook triggered' });
        });
        it('should trigger webhook with signature', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'job-1', msg: 'Webhook triggered' }))
            });
            const client = new VeloraClient({ apiKey: 'test-key', fetch: mockFetch });
            const result = await client.triggerWebhook('job-1', { event: 'ping' }, { signature: 'sha256=abc123' });
            expect(mockFetch).toHaveBeenCalledWith('https://velora-api.psalinks.com/api/v1/webhooks/job-1', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'X-Hub-Signature-256': 'sha256=abc123'
                })
            }));
            expect(result).toEqual({ id: 'job-1', msg: 'Webhook triggered' });
        });
    });
});
