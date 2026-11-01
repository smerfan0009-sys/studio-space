<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Context
- Next.js 16.4.3 (breaking from standard docs). App Router at `src/app/`.
- `npm run dev` / `build` / `lint` (`eslint` only — no test script).
- Before writing code: read `node_modules/next/dist/docs/` for this version.

## Commands
- `npm run dev` — dev server (uses turbopack + react compiler per `next.config.ts`).
- `npm run build` — production build.
- `npm run lint` — flat-config ESLint (`eslint.config.mjs`). No `lint:fix` script; fix manually.
- No tests defined in `package.json`; don't invent `npm test`.

## Config quirks (verify before assuming defaults)
- `next.config.ts`: `turbopack` with `@tailwindcss/turbopack` loader, `reactCompiler: true`, `cacheComponents: true`, `partialPrefetching: true`.
- `tsconfig.json`: `paths` `{"@/*":"./src/*"}`; `jsx: "react-jsx"`; `moduleResolution: "bundler"`.
- `eslint.config.mjs`: flat config (`defineConfig`, `globalIgnores`). Ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- `.gitignore`: `/node_modules`, `/.next/`, `/out/`, `/build`, `.env*`.

## AGENTS.md rule
- `next dev` auto-inserts the block above. Don't delete it from diffs — it recreates uncommitted. Commit it together with your changes so the tree stays clean.
