# YouTube AI Automation Manager — Frontend

React + Tailwind v4 dashboard for the pipeline backend. Built, linted, and
verified (production build + served bundle smoke-tested) — see "What was
actually verified" below.

## Pages

| Page | Status |
|---|---|
| Login (Google via Firebase) | Built |
| Home (video list + pipeline status) | Built |
| Upload (drag-drop, progress) | Built |
| Video detail (pipeline rail, transcript, AI review/approve form) | Built |
| Scheduled | Built (lists videos with `status=scheduled`) |
| Settings (connect channel, per-channel automation level) | Built |
| Analytics | Placeholder — backend routes don't exist yet |
| AI Assistant | Placeholder — backend routes don't exist yet |
| Content Calendar | Placeholder — backend routes don't exist yet |

The three placeholders say so explicitly in the UI rather than showing fake
data — a dashboard with invented numbers would be actively misleading for
a tool that makes real publishing decisions.

## Setup

```bash
cd yt-ai-frontend
npm install
cp .env.example .env.local
# Fill in real Firebase Web SDK config (these are PUBLIC values, safe to
# ship to the browser — Firebase auth is enforced by rules, not key
# secrecy) and your backend's URL.
npm run dev
```

### Firebase Web SDK config
Firebase Console → Project Settings → General → "Your apps" → Web app
(create one if you haven't). Copy the `apiKey`, `authDomain`, `projectId`,
`appId` into `.env.local`. This is a *different* credential from the
backend's service account JSON — this one is meant to be public.

### Connecting to the backend
`VITE_API_BASE_URL` should point at your running FastAPI backend
(`http://localhost:8000` in local dev). The "Connect a channel" button
does a full browser navigation to `{API_BASE}/api/auth/youtube/connect`
(not a fetch) since it's a redirect chain through Google's consent screen.

## Design

- **Ink base** (`#0F1115`) + warm paper text, not the cream/terracotta
  default — deliberate choice to read as "control room," not "blog."
- **Fraunces** for display/titles (has real character — also used for the
  AI-generated video title itself, since the title *is* the product's
  output), **Inter** for UI, **JetBrains Mono** for IDs/timestamps/status.
- **Signature element**: the pipeline rail (`components/PipelineRail.jsx`)
  — a video's progress through the pipeline rendered as a literal
  connected line of named stages, not an abstract percent bar. The whole
  product is "things happening to your video without you watching," so
  the one place that deserves a visual flourish is making that legible.
- Single signal color (`--color-signal`, orange) used only for "this
  needs your attention" — review-ready videos, the upload CTA, active
  pipeline stage. Success/failure get their own muted colors and nowhere
  else.

## What was actually verified (not just written)

- `npm run build` — clean production build, zero errors
- `npx eslint src --max-warnings 0` — zero errors after fixing real
  issues (see below), zero suppressions except one justified
  `eslint-disable` with an inline comment explaining why
- Production bundle served via `vite preview`, fetched with `curl`,
  confirmed HTTP 200 + correct `<title>` + correct font links
- Bundle JS syntax-checked with `node -c` — valid

### Real bugs found and fixed during review (not cosmetic lint silencing)
- `ChannelContext` was mirroring derived state into a second `useState` +
  effect, which is exactly the React anti-pattern the `set-state-in-effect`
  rule exists to catch — rewritten to derive `activeChannelId` with
  `useMemo` instead of an effect.
- `useVideoPolling` mutated a `ref.current` during the render body
  (`videoIdRef.current = videoId`), which is unsafe in React's render
  model — removed the ref entirely in favor of keying the effect
  directly on `videoId`.
- `useVideos`/`useChannels` had no stale-response guard — if a person
  switched channels quickly, an older in-flight request could overwrite
  newer state. Both now track a `cancelled` flag per effect run.

## NOT included yet

- Analytics, AI Assistant, Content Calendar — UI shells exist, no backend
  routes to call yet (see backend README's "NOT included yet")
- Flutter mobile app
- Toast/notification system for background events (e.g. "your scheduled
  video just published") — would need Firebase Cloud Messaging wired in
  on both ends
- Automated tests (no test runner configured yet — recommend Vitest +
  React Testing Library for the next slice)
