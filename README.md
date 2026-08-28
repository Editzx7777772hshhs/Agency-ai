# VANTA AI

An AI-powered content automation dashboard for creators — research, ideas, scripts, metadata, a video production blueprint, and a content calendar, all backed by Supabase and Claude.

This is an original interface built for this brief. It is not affiliated with, and does not copy branding or proprietary UI from, any other product.

## Stack

- React + Vite + Tailwind CSS
- Supabase (Auth, Postgres, Row Level Security, Edge Functions)
- Anthropic Claude for AI generation, called only from Edge Functions
- React Router, Lucide icons

## 1. Install

```bash
npm install
```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings (Project Settings → API). These are safe to expose to the browser — they're the public anon key, and all writes are protected by Row Level Security.

## 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`. This creates all tables, indexes, and RLS policies.
3. In **Authentication → Providers**, ensure Email is enabled. Configure the site URL / redirect URLs under **Authentication → URL Configuration** to match your dev (`http://localhost:5173`) and production URLs.

## 4. AI API setup (Edge Functions)

The frontend never talks to Anthropic directly — every generation call goes through a Supabase Edge Function, which is the only place the API key lives.

Install the Supabase CLI, then from the project root:

```bash
supabase login
supabase link --project-ref your-project-ref

supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-supabase-anon-key

supabase functions deploy research
supabase functions deploy generate-ideas
supabase functions deploy generate-script
supabase functions deploy generate-metadata
supabase functions deploy analyze-analytics
supabase functions deploy generate-video-blueprint
```

Check [docs.claude.com](https://docs.claude.com/en/docs/about-claude/models) for the current model name — update the `ANTHROPIC_MODEL` secret if the default in `supabase/functions/_shared/ai.ts` has been retired.

If `ANTHROPIC_API_KEY` isn't set, every AI page shows a clear error state rather than pretending to generate content — there is no silent fake-data fallback for the AI agents.

## 5. Local development

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign up, and a `profiles` row is created automatically on first login.

## 6. Build

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## 7. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect the repo in the Vercel dashboard. Vercel auto-detects Vite via `vercel.json`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables — **do not** add `ANTHROPIC_API_KEY` there; it belongs only in Supabase Edge Function secrets.

## Project structure

```
src/
  components/   Sidebar, Navbar, cards, modals, toast, error boundary
  pages/        one file per route (Dashboard, Research, Ideas, Scripts, …)
  lib/          supabase client, edge-function fetch wrapper
  services/     thin per-agent wrappers (researchAgent, ideaAgent, …)
  hooks/        useAuth, useProjects
supabase/
  functions/    one Edge Function per AI agent + a _shared/ folder
  schema.sql    tables, indexes, RLS policies
```

## Voice (V1)

No text-to-speech provider is wired up yet. The Voice page shows a clear "Voice API not configured" state instead of faking audio generation. To enable it, add a provider call inside a new `supabase/functions/generate-voice` function following the pattern in the other functions, then flip `VOICE_API_CONFIGURED` in `src/pages/Voice.jsx`.

## Video (V1)

VANTA does not attempt automatic video rendering. The Videos page generates an editable, exportable scene-by-scene production blueprint (narration, visuals, b-roll, on-screen text, transitions) for a human editor to work from.

## Usage limits

`usage_log` records every generation call per user so plan limits (FREE/CREATOR/PRO/AGENCY) can be enforced later. Limits are **not enforced** yet and no payment processing is included — see `src/pages/Settings.jsx`.

## Troubleshooting

- **"AI service is not configured"** — `ANTHROPIC_API_KEY` isn't set as an Edge Function secret. Re-run the `supabase secrets set` command above and redeploy the function.
- **401 on generation calls** — the user's session expired; sign out and back in.
- **Empty dashboard after login** — RLS is working correctly; a fresh account has no projects yet. Click "Create New Content".
- **Edge Function 500s locally** — run `supabase functions serve <name> --env-file .env` and check the terminal output; CORS and auth errors are logged with a specific message rather than a generic failure.
