
# @velora/sdk

Lightweight TypeScript SDK for the Velora Jobs API — easy way to create, manage and trigger jobs programmatically.

Installation

```bash
npm install @velora/sdk
# or pnpm add @velora/sdk
```

Quick start (browser)

```ts
import { VeloraClient } from '@velora/sdk'

const client = new VeloraClient({ apiKey: 'YOUR_API_KEY', baseUrl: 'https://api.velora.dev' })

const list = await client.listJobs({ limit: 10 })
console.log(list)
```

Quick start (Node.js)

```ts
import fetch from 'node-fetch' // or undici
import { VeloraClient, computeHmacSignature } from '@velora/sdk'

const client = new VeloraClient({ apiKey: process.env.VELORA_KEY, baseUrl: 'https://api.velora.dev', fetch })

// authenticated request
await client.createJob({ target_url: 'https://example.com/hook', schedule_cron: '0 9 * * *' })

// public webhook trigger with HMAC signature
const body = { event: 'ping' }
const signature = await computeHmacSignature('YOUR_WEBHOOK_SECRET', body)
await client.triggerWebhook('JOB_ID', body, { signature })
```

API (high level)

- `new VeloraClient(opts)` — opts: `{ baseUrl?, apiKey?, fetch? }`
- `listJobs(params)`, `getJob(id)`, `createJob(payload)`, `updateJob(id,payload)`, `deleteJob(id)`
- `pauseJob(id)`, `resumeJob(id)`
- `triggerJob(id)`, `enqueueJob(id)` — authenticated manual triggers
- `triggerWebhook(id, body?, { token?, signature?, headers? })` — public webhook POST (no Authorization)
- `regenerateWebhookSecret(id)`
- `listJobRuns(id, params)` — returns run history
- `getUsage()`, `getPlan()`

Helper

- `computeHmacSignature(secret, body)` — returns `sha256=<hex>` (works in browser and Node)

Notes

- Node.js: pass a `fetch` implementation via the `VeloraClient` options (e.g., `node-fetch` or `undici`).
- Errors: non-2xx responses throw an Error with `status` and `body` properties.

Publishing this package to npm

1. Ensure `package.json` fields are set (`name`, `version`, `repository`, `license`). If publishing a scoped package (e.g. `@velora/sdk`) you must publish with public access.

2. Create an npm account and generate an automation token:

```bash
npm login
npm token create --read-only=false
```

3. Publish (from the package folder):

```bash
# build first
npm run build
# publish scoped package as public
npm publish --access public
```

CI Publishing (recommended)

Use a GitHub Actions workflow and set `NPM_TOKEN` in repo secrets. Example workflow snippet (add file `.github/workflows/publish.yml`):

```yaml
name: Publish package
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm -w --filter @velora/sdk run build
      - name: Publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          cd packages/velora-js
          npm publish --access public
```

Contributing

- Open a PR, add tests/examples. The package is MIT licensed.

Questions or want me to add the GitHub Actions publish workflow now? I can add the workflow and a short `CONTRIBUTING.md` if you want.
