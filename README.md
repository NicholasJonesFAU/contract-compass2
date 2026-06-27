# Contract Compass

A privacy-conscious contract analysis web app. Paste a contract, automatically redact sensitive information, review the redacted version, and get a structured AI breakdown — all without ever storing the original unredacted text.

**Live demo:** https://contract-compassnj.netlify.app/

---

## Overview

Contract Compass lets a user paste raw contract text, which is **redacted in the browser** before anything is saved. Only the user-approved redacted version is stored, and only that redacted text is ever sent to an AI model for structured analysis (summary, risk, deadlines, obligations). The original text is never persisted anywhere.

### Core features

- **Authentication** — register, login, logout, persisted session (Supabase Auth)
- **Protected routes** — unauthenticated users are redirected to login
- **Contracts CRUD** — create, view, edit, and delete saved contracts
- **Auto-redaction** — masks emails, phone numbers, SSN-like numbers, addresses, and likely names/organizations with typed labels (`[EMAIL]`, `[PHONE]`, etc.)
- **Manual redaction review** — edit the redacted text before anything is saved or analyzed
- **AI contract analysis** — structured JSON extraction (not a chatbot): summary, plain-English summary, risk level/score, renewal/termination/payment terms, deadlines, and obligations
- **Per-user data isolation** — enforced at the database layer with Row Level Security
- **Privacy-first storage** — the original unredacted contract text is never stored

## Screenshots

| Dashboard | Redaction review |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Redaction review](docs/screenshots/redaction-review.png) |

| Contract analysis |
|---|
| ![Analysis](docs/screenshots/analysis.png) |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Auth | Supabase Auth |
| Database | Supabase Postgres + Row Level Security |
| Serverless | Netlify Functions |
| AI | OpenAI API (structured JSON extraction) |
| Hosting / CI/CD | Netlify (Git-connected, auto-deploy on push) |

## Architecture

```
Browser (React)
  │
  ├─ Supabase Auth + Postgres  ← per-user data via RLS
  │
  └─ /.netlify/functions/analyze  ← serverless function (holds the AI key)
            │
            └─ OpenAI API  ← receives only redacted text
```

The OpenAI key lives only in the serverless function's server-side environment. The browser never sees it; it calls the function, and the function calls OpenAI.

## The privacy model

This is the central design constraint of the project:

1. Raw text is pasted into the browser and held **in memory only**.
2. Auto-redaction runs client-side, producing a redacted draft with typed labels.
3. The user reviews and edits the redacted draft. Raw text is discarded the moment redaction runs.
4. **Only the redacted text** is written to the database — there is no column for unredacted text.
5. AI analysis receives **only the redacted text**, server-side, via the serverless function.

Redaction uses regex/heuristics, which reliably catch structured data (emails, phones, SSNs) but are intentionally conservative on fuzzy data (names, organizations, addresses) to avoid destroying the contract language the AI needs. The **manual review step is the safety net** for anything the auto-pass misses — a human approves the final redacted text before it is stored or analyzed.

## Local development

### Prerequisites

- Node.js 18+
- A Supabase project
- An OpenAI API key
- Netlify CLI (`npm install -g netlify-cli`)

### Setup

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
OPENAI_API_KEY=your-openai-api-key
LLM_MODEL=gpt-4o-mini
```

### Database

Apply the schema in your Supabase project's SQL editor. The full schema, RLS policies, and grants are documented in [`database/schema.md`](database/schema.md), with the entity diagram in [`database/erd.md`](database/erd.md).

### Run

```bash
# Use netlify dev (NOT npm run dev) so serverless functions run locally
netlify dev
```

The app runs at the URL printed by `netlify dev` (typically `http://localhost:8888`). Use that URL — the analysis function is only available through the Netlify proxy.

## Deployment

Deployed on Netlify, connected to GitHub for continuous deployment — every push to `main` triggers a build.

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `LLM_MODEL`) are set in the Netlify dashboard, not committed to the repo. SPA routing and function redirects are configured in [`netlify.toml`](netlify.toml).

## Project structure

```
contract-compass/
├── netlify/functions/analyze.js   # serverless AI analysis endpoint
├── src/
│   ├── components/                # Layout, ProtectedRoute
│   ├── context/                   # AuthContext (session management)
│   ├── lib/                       # supabaseClient, contracts, redaction
│   └── pages/                     # Login, Register, Dashboard, ContractForm, ContractDetail
├── database/                      # schema.md, erd.md
├── netlify.toml                   # build + redirect config
├── PLAN.md                        # project plan
├── BUILD_STEPS.md                 # incremental build roadmap
└── AGENTS.md                      # AI feature documentation
```

## Security notes

- The AI API key is server-side only (never prefixed with `VITE_`, never in the browser).
- Per-user data isolation is enforced by Postgres Row Level Security, not just application logic.
- Secrets are provided via environment variables and are never committed (`.env` is gitignored).
- Original unredacted contract text is never persisted.

## Limitations

Redaction is heuristic, not guaranteed — the manual review step exists precisely because automated redaction cannot be perfect. This is a learning project and the analysis output is informational, not legal advice.
