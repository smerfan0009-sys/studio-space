<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is
- Next.js 16.4.3 App Router + React 19.3 frontend for a studio-rental marketplace. Single package, no tests, no CI.
- Routes: `/`, `/add-studio`, `/login`, `/register`, `/my-listings`. The navbar also links `/studios`, `/dashboard`, `/my-bookings` — those pages do not exist yet (404).
- `src/components/ui/` is 63 generated shadcn/ui files; hand-written UI lives in `src/components/` and `src/app/`.

## Backend is external — not in this repo
- Auth and data come from a separate API at `NEXT_PUBLIC_API_URL` (default `http://localhost:7000`). There are **no** `src/app/api` route handlers and no middleware here.
- Only the `better-auth` client is present (`src/lib/auth-client.ts`); pages use `authClient.useSession()`, `signIn.email`, `signUp.email`, `signOut`, `signIn.social({ provider: "google" })`.
- `mongodb`, `@better-auth/mongo-adapter`, and the `MONGODB_URI` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` keys in `.env` / `.env.local` belong to that backend. `src/lib/api/README.md` is an empty placeholder — don't add DB code here unless asked.
- Studio CRUD contract: `POST ${API_URL}/api/studios`, `GET /api/my-listings`, `DELETE /api/studios/:id`, all with `credentials: "include"`. `src/app/my-listings/page.tsx` and `src/lib/auth-client.ts` fall back to `http://localhost:7000` if `NEXT_PUBLIC_API_URL` is unset.

## Commands
- `npm run dev` — turbopack + React Compiler (`next.config.ts` also enables `cacheComponents` and `partialPrefetching`). Don't remove the turbopack CSS-loader rule (`*.css` → `@tailwindcss/turbopack`) when editing config.
- `npm run build` — typecheck + static prerender; currently passes. Use this as the verification gate.
- `npm run lint` — bare `eslint`; passes with 5 pre-existing `<img>` warnings. `src/components/ui/**` is exempted from `no-explicit-any` and `react-hooks/set-state-in-effect` in `eslint.config.mjs` so generated primitives stay untouched.
- No test runner or `test` script — don't invent `npm test`.

## UI conventions (differ from stock shadcn)
- `components.json` style is `base-nova`: components wrap `@base-ui/react`, so compose with the `render` prop, not Radix `asChild` — e.g. `<Button nativeButton={false} render={<Link href="/login" />}>`. Exception: `src/components/ui/sheet.tsx` still uses `@radix-ui/react-dialog` and does accept `asChild`.
- `cn` comes from the `cn` package (shadcn's clsx + tailwind-merge replacement); `src/lib/utils.ts` only re-exports it.
- Tailwind v4 CSS-first: no `tailwind.config`. Design tokens and `.dark` overrides live in `src/app/globals.css` (`@theme inline`, `@custom-variant dark`). Palette: indigo `#6366F1` primary, pink accent, ivory `#F6F4F0` / ink `#12111A`.
- Dark mode is hand-rolled: a blocking inline script in `src/app/layout.tsx` applies the saved/system theme to `<html>` before paint, and `ThemeToggle` stays stateless (CSS `dark:` variants pick the icon). No `next-themes`.
- Fonts via `next/font/google` (Inter + Playfair Display) exposed as `--font-sans` / `--font-heading`; use `font-heading` for headings.
- `Navbar` is rendered once in `src/app/layout.tsx`, not per page.
- Images are raw `<img>` with remote Unsplash URLs; `next.config.ts` has no `images.remotePatterns`, so moving to `next/image` requires config first.

## Keep the block above
- `next dev` regenerates the top block (see `node_modules/next/dist/server/lib/generate-agent-files.js`); commit it with your changes so the tree stays clean.
