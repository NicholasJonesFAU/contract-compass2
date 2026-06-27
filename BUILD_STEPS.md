# Contract Compass — Build Steps

Incremental, verifiable build roadmap. Each step was built and verified before committing with the given conventional-commit message.

**Status legend:** ✅ done · ⏳ in progress · ⬜ not started

| Step | Title | Status |
|---|---|---|
| 0 | Planning & repo setup | ✅ |
| 1 | Initialize Vite + React app | ✅ |
| 2 | Configure Tailwind CSS | ✅ |
| 3 | Add Supabase client + env config | ✅ |
| 4 | Create database schema + RLS | ✅ |
| 5 | Registration page | ✅ |
| 6 | Login page | ✅ |
| 7 | Logout + session context | ✅ |
| 8 | Protect private routes | ✅ |
| 9 | Dashboard shell | ✅ |
| 10 | Contracts CRUD | ✅ |
| 11 | Auto-redaction API/helper | ✅ |
| 12 | Manual redaction review | ✅ |
| 13 | AI analysis API route | ✅ |
| 14 | Contract detail analysis display | ✅ |
| 15 | Privacy/security polish | ✅ |
| 16 | Netlify deployment | ✅ |
| 17 | README, AGENTS.md, and demo | ✅ |

---

## Step 0 — Planning & repo setup ✅

**Goal:** Establish the repo and planning artifacts before any application code.

**Files:** `PLAN.md`, `BUILD_STEPS.md`, `.env.example`, `.gitignore`, `database/schema.md`, `database/erd.md`, `AGENTS.md`

**Verify:** Repo on GitHub (private), all planning docs committed and rendering, `.gitignore` excludes `.env` and `node_modules`.

**Commit:** `chore: add planning docs, env example, and database design (Step 0)`

---

## Step 1 — Initialize Vite + React app ✅

**Goal:** Stand up a running React + Vite SPA.

**Files:** `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

**Verify:** `npm run dev` serves the app with no errors; placeholder landing screen renders.

**Commit:** `feat: scaffold Vite + React application (Step 1)`

---

## Step 2 — Configure Tailwind CSS ✅

**Goal:** Wire Tailwind into the build for utility-first styling.

**Files:** `vite.config.js` (Tailwind v4 plugin), `src/index.css`

**Note:** Tailwind v4 uses the `@tailwindcss/vite` plugin and a single `@import "tailwindcss";` — no `tailwind.config.js` or `postcss.config.js` needed.

**Verify:** A Tailwind utility class visibly affects the page; no build warnings.

**Commit:** `feat: configure Tailwind CSS (Step 2)`

---

## Step 3 — Add Supabase client + env config ✅

**Goal:** Create a single Supabase client wired to environment variables.

**Files:** `src/lib/supabaseClient.js`, `.env`, `.env.example`

**Verify:** Client initializes from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; no keys hardcoded.

**Commit:** `feat: add Supabase client and environment configuration (Step 3)`

---

## Step 4 — Create database schema + RLS ✅

**Goal:** Create the `contracts` table, lock it down with RLS, and grant table access to authenticated users.

**Files:** `database/schema.md`, Supabase SQL editor

**Verify:** `contracts` table exists with all columns; `rowsecurity = true`; four policies (select/insert/update/delete) scoped to `auth.uid() = user_id`; `grant` applied to `authenticated`.

**Commit:** `feat: add contracts schema and row level security policies (Step 4)`

---

## Step 5 — Registration page ✅

**Goal:** Let new users create an account via Supabase Auth (email confirmation disabled for smooth demo).

**Files:** `src/pages/Register.jsx`, router setup

**Verify:** Submitting email + password creates a user in Supabase Auth → Users; validation/error states surfaced.

**Commit:** `feat: add user registration page (Step 5)`

---

## Step 6 — Login page ✅

**Goal:** Authenticate existing users and start a session.

**Files:** `src/pages/Login.jsx`, `src/App.jsx`

**Verify:** Valid credentials log in and redirect; invalid credentials show a clear error and do not navigate.

**Commit:** `feat: add login page (Step 6)`

---

## Step 7 — Logout + session context ✅

**Goal:** Provide a global auth/session context and a logout action.

**Files:** `src/context/AuthContext.jsx`, `src/main.jsx`

**Verify:** Session persists across reloads (`getSession` on load + `onAuthStateChange`); logout clears the session.

**Commit:** `feat: add session context and logout (Step 7)`

---

## Step 8 — Protect private routes ✅

**Goal:** Gate authenticated pages behind a route guard.

**Files:** `src/components/ProtectedRoute.jsx`, `src/pages/Dashboard.jsx`, `src/App.jsx`

**Verify:** Logged-out visit to a protected route redirects to `/login`; logged-in users reach it; no flash-redirect on refresh (handled by the `loading` flag).

**Commit:** `feat: protect private routes with auth guard (Step 8)`

---

## Step 9 — Dashboard shell ✅

**Goal:** Build the authenticated app layout: dark sidebar nav + header.

**Files:** `src/components/Layout.jsx`, `src/pages/Dashboard.jsx`

**Verify:** Dashboard renders inside the layout with sidebar, user email, and working logout.

**Commit:** `feat: add dashboard shell and layout (Step 9)`

---

## Step 10 — Contracts CRUD ✅

**Goal:** Full create/read/edit/delete for contract records, scoped per user.

**Files:** `src/lib/contracts.js`, `src/pages/ContractForm.jsx`, `src/pages/Dashboard.jsx`, `src/App.jsx`

**Verify:** Create/list/edit/delete all work; two-user RLS test confirms isolation (user B cannot see user A's contracts).

**Commit:** `feat: implement contracts CRUD (Step 10)`

---

## Step 11 — Auto-redaction helper ✅

**Goal:** Generate a redacted draft from pasted raw text, in memory.

**Files:** `src/lib/redaction.js`

**Note:** Conservative detection — high-confidence patterns (email/phone/SSN) catch reliably; fuzzy patterns (name/org/address) are intentionally limited to avoid destroying contract language. Manual review is the safety net.

**Verify:** Sample text masked with typed labels (`[EMAIL]`, `[PHONE]`, etc.); normal contract words not over-redacted; raw input never stored.

**Commit:** `feat: add auto-redaction helper (Step 11)`

---

## Step 12 — Manual redaction review ✅

**Goal:** Let the user review and edit the redacted draft before analysis.

**Files:** `src/pages/ContractForm.jsx`

**Note:** Implemented as a two-stage flow (paste → review) inside `ContractForm` rather than a separate routed page. This keeps raw text in a single component's local memory and out of router history — fewer surfaces holding raw PII.

**Verify:** Auto-redacted text shown editable; raw text discarded once redaction runs; only `redacted_text` saved. Supabase row check confirms labels, not raw values, are stored.

**Commit:** `feat: add manual redaction review page (Step 12)`

---

## Step 13 — AI analysis API route ✅

**Goal:** Serverless route that sends redacted text to OpenAI and returns structured JSON.

**Files:** `netlify/functions/analyze.js`, `netlify.toml`, `src/lib/contracts.js`

**Verify:** Function reads `OPENAI_API_KEY` from server env; returns schema-matching JSON; rejects empty input and handles malformed output gracefully. Network tab confirms the call goes to the function, not openai.com.

**Commit:** `feat: add serverless OpenAI analysis route (Step 13)`

---

## Step 14 — Contract detail analysis display ✅

**Goal:** Persist and render the structured analysis for a contract.

**Files:** `src/pages/ContractDetail.jsx`, `src/lib/contracts.js`, `src/pages/Dashboard.jsx`, `src/App.jsx`

**Verify:** Analysis saves to the contract row and survives reload; detail view renders risk, summaries, terms, deadlines, and obligations from the stored fields.

**Commit:** `feat: persist and display structured contract analysis (Step 14)`

---

## Step 15 — Privacy/security polish ✅

**Goal:** Verify the privacy model and remove any leaks.

**Files:** cross-cutting; `.env.example`, `ContractForm.jsx` cleanup

**Verify:** No raw PII in any DB row; `git log -- .env` empty (key never committed); key not exposed in browser; `.env.example` placeholders only; RLS re-verified.

**Commit:** `chore: privacy and security hardening (Step 15)`

---

## Step 16 — Netlify deployment ✅

**Goal:** Deploy the app and functions to Netlify with env config and CI/CD.

**Files:** `netlify.toml` (SPA fallback + function redirects), Netlify dashboard, Supabase URL config

**Verify:** Build succeeds; live site loads; register/create/redact/analyze all work in production; refresh on deep links does not 404; env vars set in Netlify dashboard.

**Live URL:** https://contract-compassnj.netlify.app/

**Commit:** `chore: configure Netlify deployment (Step 16)`

---

## Step 17 — README, AGENTS.md, and demo ✅

**Goal:** Finalize docs and a runnable demo path.

**Files:** `README.md`, `AGENTS.md`, `PLAN.md`, `BUILD_STEPS.md`, `docs/screenshots/`

**Verify:** README covers overview, stack, setup, env vars, run/deploy, and the privacy model; AGENTS.md describes the AI contract and guardrails; demo walkthrough reproduces the full flow; all steps ✅.

**Commit:** `docs: add README, AGENTS.md, and demo walkthrough (Step 17)`
