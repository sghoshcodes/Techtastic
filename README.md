# Techtastic

A resume-aware, urgency-driven news feed PWA for new grad / early career tech job seekers.

Upload your resume once. Techtastic parses it with the free Google Gemini API, then ranks every live tech role and recruiting event by how well it matches your profile — closing-soon and just-opened items always rise to the top. Live Reddit buzz from r/csMajors and r/cscareerquestions rounds out the third tab.

Installable on iPhone Home Screen. No login. No backend database. $0 to run.

## Features

- **For You** — combined roles + events feed sorted by urgency, then by personalized fit score
- **Deadlines** — visual 7-day timeline of everything closing this week
- **Buzz** — hot recruiting threads from r/csMajors and r/cscareerquestions
- **Resume parsing** — Gemini 1.5 Flash extracts skills, experience, target roles, and projects
- **Pull to refresh** on mobile, manual refresh button on desktop
- **Installable PWA** — Add to Home Screen on iOS/Android for full-screen app feel

## Tech stack

- React 18 + Vite 5
- Tailwind CSS 3
- vite-plugin-pwa (service worker + manifest)
- @google/generative-ai (Gemini 1.5 Flash, free tier)
- pdfjs-dist (client-side PDF text extraction)
- Vercel serverless functions for `/api/roles`, `/api/events`, `/api/buzz`

## Quick start

### 1. Clone and install

```bash
git clone <your-fork-url> techtastic
cd techtastic
npm install
```

### 2. Get a free Gemini API key

1. Go to <https://aistudio.google.com>
2. Sign in with any Google account
3. Click **Get API Key** → **Create API key in new project**
4. No credit card required. Free tier is **15 requests/min, 1M tokens/day** — far more than you'll ever need.

Copy the key, then create `.env` from the template:

```bash
cp .env.example .env
# then edit .env and paste your key after VITE_GEMINI_API_KEY=
```

### 3. Run locally

For UI-only iteration (no `/api/*` routes):

```bash
npm run dev
```

For the full app including serverless API routes (recommended), install the Vercel CLI and use `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` serves both the Vite app and the Node functions in `api/` together at <http://localhost:3000>.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new>, import the repo. Vercel auto-detects Vite.
3. Add the env var **before** the first build:
   - **Project Settings → Environment Variables**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: your Gemini key
   - Apply to: Production, Preview, Development
4. Click **Deploy**. You'll get a `https://<project>.vercel.app` URL.
5. Every push to your default branch auto-deploys.

## Install on iPhone

1. Open the Vercel URL in **Safari** (not Chrome — iOS only allows installs from Safari).
2. Tap the **Share** button.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm. The app icon appears on your home screen and launches in full-screen mode.

## Install on Android

Open the URL in Chrome, then tap the menu → **Add to Home screen** (or look for the install banner).

## Project structure

```
techtastic/
├── api/                       # Vercel serverless functions
│   ├── _lib/
│   │   ├── markdown.js        # parses GitHub README job tables
│   │   └── seedEvents.js      # curated recruiting events (always-on fallback)
│   ├── roles.js               # GitHub repos + intern-list (best-effort)
│   ├── events.js              # Luma/Eventbrite (best-effort) + seed list
│   └── buzz.js                # Reddit hot posts
├── public/
│   ├── manifest.json
│   ├── apple-touch-icon.png
│   └── icons/
├── scripts/
│   └── generate-icons.mjs     # one-shot PNG icon generator (Node, no deps)
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/            # Header, BottomNav, FeedCard, ...
│   ├── views/                 # ForYou, Deadlines, Buzz
│   ├── hooks/                 # useFeedData, usePullToRefresh
│   └── utils/                 # parseResume, fitScore, urgency, api
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

## How fit scoring works

`computeFitScore` weighs:
- **70%** — skill keyword overlap between your resume and the role's title/company/tags
- **30%** — company tier (curated Tier 1 / Tier 2 / other)

Badge colors: 80+ green, 60-79 amber, below 60 gray. Tier lists live in [`src/utils/fitScore.js`](src/utils/fitScore.js) — edit to taste.

## How urgency works

- Deadline within 2 days → red "Closes in Nd"
- Deadline within 7 days → amber "Closes in Nd"
- Posted within 24 hours → green "Just opened"

Items in the For You feed are sorted by urgency tier first, then by fit score within each tier.

## Notes / caveats

- **VITE_GEMINI_API_KEY is exposed to the browser.** Vite inlines anything prefixed `VITE_` into the client bundle. This is acceptable for a free hobby app, but if abuse becomes a concern, rotate the key (Google AI Studio → API Keys → Delete) and consider proxying parsing through a server function instead.
- **Resume PDFs must contain selectable text.** Scanned/image-only PDFs won't extract — the app will surface a clear error.
- **Luma and Eventbrite** removed easy public event-search APIs. We attempt a best-effort JSON-LD scrape and always merge with a curated seed list in [`api/_lib/seedEvents.js`](api/_lib/seedEvents.js) — edit that file to keep the events fresh.
- **intern-list.com** scraping is best-effort and silently degrades if their HTML structure changes.
- **Reddit** rate-limits aggressive requests. The 10-minute client cache and Cache-Control headers on the function help.

## Regenerating PWA icons

If you want to swap the green-with-white-T placeholders for your own branding, replace these files:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/apple-touch-icon.png`

Or modify and rerun the generator:

```bash
node scripts/generate-icons.mjs
```

## Scripts

| Script             | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Vite dev server (UI only, no `/api/*`)                    |
| `npm run dev:full` | Alias for `vercel dev` (full stack incl. API routes)      |
| `npm run build`    | Production build into `dist/`                             |
| `npm run preview`  | Serve the built `dist/` locally                           |

## License

MIT — do whatever you want.
