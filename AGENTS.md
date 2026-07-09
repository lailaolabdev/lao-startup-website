# Frontend Agent Guide

This guide applies to `lao-startup-website`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Rules

- Use the App Router under `src/app`.
- Prefer server components by default; add `'use client'` only for browser state, effects, local storage, cookies, or event handlers.
- Keep `src/app/layout.tsx` responsible for global fonts, metadata, `Header`, `Footer`, analytics, and `LanguageProvider`.
- Use `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'` for backend calls.
- For uploaded asset paths returned as `/uploads/...`, build image/file URLs from the API origin without `/api`.
- Admin pages use `localStorage.admin_token`; do not commit hard-coded JWTs.
- Use `FormData` for upload flows and do not manually set `Content-Type`.
- Keep English and Lao copy aligned in pages that already use `useLanguage`.
- Use Tailwind CSS utilities and existing visual patterns before adding new styling systems.
- Use `lucide-react` icons when an icon is needed.
- Be aware that `src/app/directory/%5Bid%5D` is likely intended to be `src/app/directory/[id]`.

## Verification

Run:

```bash
pnpm lint
pnpm build
```

For UI changes, also run the app locally and check desktop and mobile responsive states.
