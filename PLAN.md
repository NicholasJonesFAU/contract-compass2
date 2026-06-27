# Contract Compass — Project Plan

## Description

Contract Compass is a **privacy-conscious contract analysis web app**. Users log in, create contract records, and paste raw contract text. The app **auto-redacts** sensitive information (emails, phone numbers, SSN-like numbers, addresses, possible names/company names) into a redacted draft. The user **manually reviews and edits** that redacted version, and only the final redacted text is ever sent to an AI API for **structured contract analysis**.

The defining constraint: **the original unredacted contract text is never persisted.** Redaction happens client-side/in-memory, the user approves a redacted version, and only that version is stored and analyzed.

## Goals

- Ship a deployed, authenticated full-stack web app that satisfies every required class element.
- Demonstrate Supabase Auth + Postgres + Row Level Security with strict per-user data isolation.
- Build a **structured extraction** AI feature (returns typed JSON, not a freeform chatbot).
- Treat privacy as a first-class design constraint: no unredacted text at rest, secrets in env vars only.
- Keep a clean repo with a meaningful, conventional git history, a README, and an AGENTS.md.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React + Vite | SPA, fast dev server, matches FiberTrack |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Auth | Supabase Auth | Email/password, persisted session |
| Database | Supabase Postgres | `contracts` table |
| Authorization | Supabase RLS | Per-user row isolation |
| Serverless API | Netlify Functions | Holds the OpenAI key, performs AI calls |
| AI provider | OpenAI API | Structured JSON extraction (JSON mode) |
| Hosting / CI/CD | Netlify | Git-based deploys from `main` |
| Secrets | Environment variables | `.env` local, Netlify env in prod |

## Core Features

1. **Authentication** — register, login, logout, persisted session across reloads.
2. **Protected routes** — unauthenticated users are redirected to the login page.
3. **Contracts CRUD** — create, view, edit, and delete saved contract records.
4. **Auto-redaction** — detect and mask emails, phones, SSN-like numbers, addresses, and likely names/company names.
5. **Manual redaction review** — user can edit the redacted text before any analysis runs.
6. **AI contract analysis** — send only the final redacted text to the AI and return structured JSON.
7. **User-specific data** — RLS guarantees users only ever see their own contracts.
8. **Privacy-first storage** — the original unredacted contract text is never stored.

## Data Model Summary

Single primary table: **`contracts`**, one row per saved contract, owned by a user via `user_id`.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Row identity |
| `user_id` | uuid → `auth.users(id)` | Owner, drives RLS |
| `title` | text (not null) | Human label for the contract |
| `redacted_text` | text | Approved redacted text (the only contract body stored) |
| `summary` | text | AI: concise summary |
| `plain_english_summary` | text | AI: layperson summary |
| `risk_level` | text | AI: Low / Medium / High |
| `risk_score` | integer | AI: 1–10 numeric risk |
| `auto_renewal` | boolean | AI: does it auto-renew |
| `renewal_terms` | text | AI: renewal details |
| `termination_terms` | text | AI: termination details |
| `payment_terms` | text | AI: payment details |
| `important_deadlines` | jsonb | AI: array of deadline objects |
| `obligations` | jsonb | AI: array of obligation objects |
| `created_at` | timestamptz | Insert time |
| `updated_at` | timestamptz | Last update time |

> **Privacy note:** there is intentionally **no** column for raw/unredacted text. Full schema in [`database/schema.md`](database/schema.md); diagram in [`database/erd.md`](database/erd.md).

## Milestones

| # | Milestone | Build Steps | Definition of done |
|---|---|---|---|
| M0 | Project scaffolding | 0–3 | Repo, Vite app, Tailwind, Supabase client all wired |
| M1 | Auth + protected app shell | 4–9 | Schema/RLS live; register/login/logout; routes protected; dashboard renders |
| M2 | Contracts CRUD | 10 | Create/read/edit/delete contracts, scoped per user |
| M3 | Redaction pipeline | 11–12 | Auto-redaction + manual review working end to end |
| M4 | AI analysis | 13–14 | Redacted text → structured JSON → stored → displayed |
| M5 | Hardening + ship | 15–17 | Privacy/security polish, Netlify deploy, README + AGENTS.md + demo |

## Suggested GitHub Project Board Issues

**Setup**
- [ ] Scaffold Vite + React app
- [ ] Configure Tailwind CSS
- [ ] Add Supabase client and `.env.example`
- [ ] Write `database/schema.md` and apply schema in Supabase
- [ ] Enable RLS + per-user policies on `contracts`

**Auth**
- [ ] Registration page
- [ ] Login page
- [ ] Logout + session context provider
- [ ] Protected route wrapper / redirect logic

**Contracts**
- [ ] Dashboard shell + navigation
- [ ] Contracts list (read)
- [ ] Create contract flow
- [ ] Edit contract
- [ ] Delete contract (with confirm)

**Redaction**
- [ ] Auto-redaction helper (emails/phones/SSN/addresses/names)
- [ ] Manual redaction review/edit page
- [ ] Block analysis until redaction approved

**AI Analysis**
- [ ] Netlify function: OpenAI structured extraction
- [ ] Persist structured JSON to `contracts`
- [ ] Contract detail analysis view (risk, deadlines, obligations)

**Polish & Ship**
- [ ] Confirm no unredacted text is ever stored
- [ ] Secrets audit (env vars only, nothing committed)
- [ ] Netlify deployment + env config
- [ ] README, AGENTS.md, demo walkthrough

## Out of Scope (for this mini-project)

- File upload / PDF or DOCX parsing (paste-only text input).
- OCR or image-based contracts.
- Multi-user collaboration, sharing, or team workspaces.
- Contract editing/redlining or e-signature.
- Document versioning / revision history beyond `updated_at`.
- Conversational chatbot Q&A over contracts (the AI feature is structured extraction only).
- Billing, payments, or subscription tiers.
- Email/SMS notifications for deadlines.
- Advanced ML-based PII detection or guaranteed-perfect redaction (regex/heuristics + human review is the model).
- Non-English contracts and jurisdiction-specific legal logic.
- Admin dashboards, analytics, or audit logging.
