# MSIC Website

Next.js frontend for MSIC, the MSME and Startup Innovation Center. It provides the public website, MSME/startup directory, event/news pages, applicant portal, and admin screens that call the Express API.

## Stack

- Next.js 16.2.9 App Router
- React 19.2.4
- Tailwind CSS 4
- TypeScript
- `lucide-react` icons
- `recharts` for dashboard charts

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

The frontend expects the backend at `http://localhost:8002/api` unless `NEXT_PUBLIC_API_URL` is set.

Optional `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8002/api
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start local Next.js dev server |
| `pnpm build` | Build production app |
| `pnpm start` | Start production server after build |
| `pnpm lint` | Run ESLint |

## App Structure

```text
src/app/                  # App Router pages and layouts
src/components/           # Shared Header, Footer, analytics, news UI
src/context/              # Language provider and hook
public/fonts/             # Local Noto Sans fonts
public/video/             # Landing page video asset
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/directory` | MSIC MSME/startup directory with search, filter, pagination, and mock fallback |
| `/directory/[id]` | Participant detail and partner matchmaking request |
| `/events` | Event listing, sponsor display, and registration |
| `/news` | News listing |
| `/portal/startup` | Applicant/partner login, registration, participant profile, matchmaking inbox |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin dashboard |
| `/admin/events` | Admin event creation |
| `/admin/news` | Admin news CRUD with image upload |
| `/admin/sponsors` | Admin sponsor CRUD with logo upload and Home page visibility |
| `/admin/startups` | Admin startup company CRUD for the public directory, including logo and traction metrics |
| `/admin/verifications` | Admin startup approval UI |

Note: the startup detail folder is currently named `src/app/directory/%5Bid%5D`. If `/directory/:id` should behave as a dynamic route, rename that folder to `[id]`.

## API Integration

Use:

```ts
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'
```

Current API areas:

- Auth: `/auth/register`, `/auth/login`
- Startups: `/startups`, `/startups/profile/me`, `/startups/:id/verify`
- Events: `/events`, `/events/:id/register`
- Sponsors: `/sponsors` and Home placement filter `/sponsors?placement=home`
- News: `/news`
- Matchmaking: `/matchmaking/request`, `/matchmaking/inbox`, `/matchmaking/:id`

Admin pages store the admin token in `localStorage` under `admin_token`.

For upload requests, use `FormData` and let the browser set the request boundary.

## Language

The app supports English and Lao through `src/context/LanguageContext.tsx`.

- Valid language values are `EN` and `LA`.
- The selected language is stored in the `lang` cookie.
- `RootLayout` reads the cookie and initializes `LanguageProvider`.
- Keep bilingual UI text in sync when changing pages that already support both languages.

## Verify

```bash
pnpm lint
pnpm build
```
