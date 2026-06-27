# Contract Compass — Project Plan

## Description

Contract Compass is a **privacy-conscious contract analysis web app**. Users log in, create contract records, and paste raw contract text. The app **auto-redacts** sensitive information (emails, phone numbers, SSN-like numbers, addresses, possible names/organizations) into a redacted draft. The user **manually reviews and edits** that redacted version, and only the final redacted text is ever sent to an AI API for **structured contract analysis**.

The defining constraint: **the original unredacted contract text is never persisted.** Redaction happens in-browser, the user approves a redacted version, and only that version is stored and analyzed.

## Goals

- Ship a deployed, authenticated full-stack web app that satisfies every required class element.
- Demonstrate Supabase Auth + Postgres + Row Level Security with strict per-user data isolation.
- Build a **structured extraction** AI feature (returns typed JSON, not a freeform chatbot).
- Treat privacy as a first-class design constraint: no unredacted text at rest, secrets in env vars only.
- Keep a clean repo with a meaningful, conventional git history, a README, and an AGENTS.md.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | React + Vite |
| Styling | Tailwind CSS (v4 Vite plugin) |
| Routing | React Router |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Authorization | Supabase RLS |
| Serverless API | Netlify Functions |
| AI provider | OpenAI API (`gpt-4o-mini`, structured JSON) |
| Hosting / CI/CD | Netlify (Git-connected) |
| Secrets | Environment variables |

## Core Features

1. **Authentication** — register, login, logout, persisted session.
2. **Protected routes** — unauthenticated users redirected to login.
3. **Contracts CRUD** — create, view, edit, delete saved contracts.
4. **Auto-redaction** — redact emails, phones, SSN-like numbers, addresses, possible names/organizations.
5. **Manual redaction review** — user edits redacted text before analysis.
6. **AI contract analysis** — send only final redacted text to AI; return structured JSON.
7. **User-specific data** — users only see their own contracts via RLS.
8. **Privacy-first storage** — original unredacted contract text is never stored.

## Data Model Summary

Single table: **`contracts`**, one row per saved contract, owned by a user via `user_id`. Full schema in [`database/schema.md`](database/schema.md); diagram in [`database/erd.md`](database/erd.md).

Columns: `id`, `user_id`, `title`, `redacted_text`, `summary`, `plain_english_summary`, `risk_level`, `risk_score`, `auto_renewal`, `renewal_terms`, `termination_terms`, `payment_terms`, `important_deadlines` (jsonb), `obligations` (jsonb), `created_at`, `updated_at`.

> **Privacy note:** there is intentionally **no** column for raw/unredacted text.

## Milestones (all complete)

| # | Milestone | Steps | Status |
|---|---|---|---|
| M0 | Project scaffolding | 0–3 | ✅ |
| M1 | Auth + protected app shell | 4–9 | ✅ |
| M2 | Contracts CRUD | 10 | ✅ |
| M3 | Redaction pipeline | 11–12 | ✅ |
| M4 | AI analysis | 13–14 | ✅ |
| M5 | Hardening + ship | 15–17 | ✅ |

## Out of Scope (for this mini-project)

- File upload / PDF or DOCX parsing (paste-only text input).
- OCR or image-based contracts.
- Multi-user collaboration, sharing, or team workspaces.
- Contract editing/redlining or e-signature.
- Document versioning beyond `updated_at`.
- Conversational chatbot Q&A (the AI feature is structured extraction only).
- Billing, payments, or subscription tiers.
- Email/SMS deadline notifications.
- Advanced ML-based PII detection or guaranteed-perfect redaction (regex + human review is the model).
- Non-English contracts and jurisdiction-specific legal logic.
- Admin dashboards or audit logging.
