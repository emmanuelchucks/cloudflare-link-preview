# Cloudflare Link Preview

A small Cloudflare Worker app that fetches a URL, extracts common metadata, and renders a preview card in a React client.

## Stack

- Cloudflare Workers for the API
- Hono for routing and request validation
- React for the client
- Valibot for the shared response schema
- Vite+ for dev, build, checking, and preview
- `@kasoa/vite-plus-config` for shared linting and formatting defaults

## Scripts

```bash
pnpm dev
pnpm check
pnpm check:fix
pnpm build
pnpm preview
pnpm deploy
pnpm typegen
```

## Development

1. Install dependencies:

```bash
pnpm install
```

2. Start the app:

```bash
pnpm dev
```

3. Open the local URL printed by Vite+.

## How It Works

- The client submits a URL to the Worker API.
- The Worker fetches the page HTML with a short timeout and a custom user agent.
- Metadata is extracted from common tags such as `title`, `og:title`, `og:description`, and `twitter:image`.
- The Worker normalizes relative asset URLs and returns a typed JSON payload.
- The client validates that payload with the shared schema in [src/link-preview.ts](/Users/emmanuelchucks/projects/cloudflare-link-preview/src/link-preview.ts) before rendering the preview card.

## Notes

- Generated Cloudflare type files are excluded by the shared Vite+ config.
- The Worker configuration lives in [wrangler.jsonc](/Users/emmanuelchucks/projects/cloudflare-link-preview/wrangler.jsonc).
- The Worker entrypoint is [worker/index.ts](/Users/emmanuelchucks/projects/cloudflare-link-preview/worker/index.ts).
