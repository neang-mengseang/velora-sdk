# @rimora/velora

Official TypeScript SDK for the Velora Jobs API.

This package provides a small, well-typed client for scheduling HTTP jobs, managing webhooks, and inspecting run history.

Contents
- `src/` — TypeScript source (types + implementation)
- `dist/` — built output created by `tsc` (not committed; produced by `prepare` or CI)

---
## Installation

```bash
npm install @rimora/velora
# or
pnpm add @rimora/velora
# or
yarn add @rimora/velora
```

---
## Quick Start

### Browser (ESM/TS)

```ts
import { VeloraClient } from '@rimora/velora'
const client = new VeloraClient({ apiKey: 'YOUR_API_KEY' })
const jobs = await client.listJobs({ limit: 10 })
```

### Node.js (provide fetch)

```ts
import fetch from 'node-fetch' // or undici
import { VeloraClient, computeHmacSignature, DEFAULT_BASE_URL } from '@rimora/velora'

const client = new VeloraClient({ 
  apiKey: process.env.VELORA_KEY, 
  fetch, 
  baseUrl: process.env.VELORA_API_URL 
})

// create job with folder
await client.createJob({
  name: 'daily-report',
  target_url: 'https://example.com/hook',
  schedule_cron: '0 9 * * *',
  folder_path: '/reports/'  // organize jobs into folders
})

// list jobs in a specific folder
const jobs = await client.listJobs({ folder_path: '/reports/' })

// trigger public webhook with HMAC signature
const body = { event: 'ping' }
const signature = await computeHmacSignature('YOUR_WEBHOOK_SECRET', body)
await client.triggerWebhook('JOB_ID', body, { signature })
```

---
## Core Features

### Client Configuration

- `VeloraClient(opts)` — constructor options: `{ baseUrl?: string, apiKey?: string, fetch?: FetchLike }`.
- `DEFAULT_BASE_URL` — exported default endpoint (`https://api.velora.dev`).

### Job management
- `listJobs(params)` — paginated response: `{ jobs, total, limit, offset }`.
  - Supports filtering by `folder_path` to get jobs in a specific folder
- `bulkGetJobs(payload)` — fetch multiple jobs by IDs in a single request: `{ jobs, total }`.
  - Accepts `{ ids: string[] }` with maximum 100 IDs per request
- `batchCreateJobs(payload)` — create multiple jobs in a single request: `{ jobs, total, created, failed }`.
  - Accepts `{ jobs: JobCreatePayload[] }` with maximum 100 jobs per request
- `batchUpdateJobs(payload)` — update multiple jobs in a single request: `{ jobs, total, updated, failed }`.
  - Accepts `{ jobs: (JobUpdatePayload & { id: string })[] }` with maximum 100 jobs per request
- `batchDeleteJobs(payload)` — delete multiple jobs in a single request: `{ jobs, total, deleted, failed }`.
  - Accepts `{ ids: string[] }` with maximum 100 IDs per request
- `getJob(id)`, `createJob(payload)`, `updateJob(id,payload)`, `deleteJob(id)`.
- `pauseJob(id)`, `resumeJob(id)`, `batchResumeJobs(payload)`, `triggerJob(id)` — trigger for immediate execution.

### Bulk Fetch Jobs

Fetch multiple jobs by their IDs in a single request:

```ts
// Fetch multiple specific jobs
const result = await client.bulkGetJobs({
  ids: ['job-id-1', 'job-id-2', 'job-id-3']
})

console.log(result.jobs) // Array of jobs
console.log(result.total) // Number of jobs returned
```

**Note:** Maximum 100 IDs per request. Only jobs belonging to the authenticated owner are returned.

### Batch Resume Jobs

Resume multiple paused or dead jobs in a single request:

```ts
// Resume multiple jobs
const result = await client.batchResumeJobs({
  ids: ['job-id-1', 'job-id-2', 'job-id-3']
})

console.log('Resumed:', result.resumed)
console.log('Skipped:', result.skipped)
console.log('Total:', result.total)
```

**Note:** Maximum 100 IDs per request. Only jobs with status "paused" or "dead" will be resumed. Jobs that are already active will be skipped.

### Batch Create Jobs

Create multiple jobs in a single request:

```ts
// Create multiple jobs
const result = await client.batchCreateJobs({
  jobs: [
    { target_url: 'https://example.com/hook1', schedule_cron: '0 9 * * *' },
    { target_url: 'https://example.com/hook2', schedule_cron: '0 10 * * *' }
  ]
})

console.log('Created:', result.created)
console.log('Failed:', result.failed)
console.log('Total:', result.total)
```

**Note:** Maximum 100 jobs per request. Subject to your plan's job limit. Jobs that fail validation will be skipped.

### Batch Update Jobs

Update multiple jobs in a single request:

```ts
// Update multiple jobs
const result = await client.batchUpdateJobs({
  jobs: [
    { id: 'job-id-1', name: 'Updated Name' },
    { id: 'job-id-2', schedule_cron: '0 8 * * *' }
  ]
})

console.log('Updated:', result.updated)
console.log('Failed:', result.failed)
console.log('Total:', result.total)
```

**Note:** Maximum 100 jobs per request. Each job must include an id. Jobs that don't exist will be skipped.

### Batch Delete Jobs

Delete multiple jobs in a single request:

```ts
// Delete multiple jobs
const result = await client.batchDeleteJobs({
  ids: ['job-id-1', 'job-id-2']
})

console.log('Deleted:', result.deleted)
console.log('Failed:', result.failed)
console.log('Total:', result.total)
```

**Note:** Maximum 100 IDs per request. This operation is irreversible - it deletes jobs and all associated job runs. Jobs that don't exist will be skipped.

### Folder Organization

Jobs can be organized into virtual folders using `folder_path`:

```ts
// Create jobs in folders
await client.createJob({
  name: 'daily-report',
  target_url: 'https://example.com/hook',
  schedule_cron: '0 9 * * *',
  folder_path: '/reports/daily/'
})

await client.createJob({
  name: 'weekly-summary',
  target_url: 'https://example.com/hook',
  schedule_cron: '0 9 * * 0',
  folder_path: '/reports/weekly/'
})

// List all jobs in a folder
const jobs = await client.listJobs({ folder_path: '/reports/' })

// List jobs at root level
const rootJobs = await client.listJobs({ folder_path: '/' })
```

**Folder path format:**
- Must start and end with `/` (e.g., `/reports/`, `/checkin/monday/`)
- Root level jobs use `/` as the folder path
- Nested folders are supported (e.g., `/reports/daily/`)

### Runs & History

- `listJobRuns(jobId, { limit?, offset? })` → `{ runs, total, limit, offset }`.
- Get execution history for a specific job

### Account & Plan

- `getUsage()` → `{ usage, limits, period }`.
- `getPlan()` → `{ subscription, plan }`.

### Webhooks

- `triggerWebhook(id, body?, opts?)` — public webhook POST; accepts `token` (X-Webhook-Token) or `signature` (X-Hub-Signature-256) in `opts`.
- `regenerateWebhookSecret(jobId)` → returns new secret.

### Types and Errors

- `types.ts` exports all DTOs used by the client (jobs, runs, plan, usage, payloads).
- `VeloraError` — thrown for non-2xx responses; has `status: number` and `body: ApiErrorBody | null`.

### Helpers

- `computeHmacSignature(secret, body)` — returns `sha256=<hex>` compatible with `X-Hub-Signature-256`; works in browser (SubtleCrypto) and Node (crypto).

---
## Design Notes

- Default endpoint is `DEFAULT_BASE_URL = 'https://api.velora.dev'`, but callers can override via `baseUrl` or `VELORA_API_URL` environment variable.
- The client does not implicitly retry; callers may add backoff/retry behavior if needed.
- Folder paths are virtual - they're derived from the `folder_path` field on jobs, not separate database entities.

---
## Development

- Build: `pnpm -w --filter @rimora/velora run build`
- Typecheck: `pnpm -w --filter @rimora/velora run build`
- Local test tarball: `cd packages/velora-js && pnpm run build && npm pack`

---
## Releasing

- CI publishes when you push a tag matching `v*` (see `.github/workflows/publish.yml`).
- Add a repo secret `NPM_TOKEN` with an npm Automation token (publish scope, bypass 2FA) to enable CI publish.

### Release Flow

```bash
# bump version in packages/velora-js/package.json or use `npm version`
git commit -am "chore(release): prepare vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

### Git Strategy for `dist`

- We do not commit `dist/` to the repo. The package contains a `prepare` script so installing directly from Git will build the SDK on install.

---
## Contributing

- Open a PR with descriptive tests or examples. Keep changes focused and update `types.ts` if API shapes change.

---
## License

MIT
