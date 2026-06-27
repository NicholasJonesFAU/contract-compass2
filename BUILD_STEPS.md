# Contract Compass — Build Steps

Incremental, verifiable build roadmap. Work **one step at a time**, verify the checkpoint, then commit with the given message before moving on.

**Status legend:** ✅ done · ⏳ in progress · ⬜ not started

|Step|Title|Status|
|-|-|-|
|0|Planning \& repo setup|✅|
|1|Initialize Vite + React app|✅|
|2|Configure Tailwind CSS|✅|
|3|Add Supabase client + env config|✅|
|4|Create database schema + RLS|✅|
|5|Registration page|✅|
|6|Login page|✅|
|7|Logout + session context|✅|
|8|Protect private routes|✅|
|9|Dashboard shell|✅|
|10|Contracts CRUD|✅|
|11|Auto-redaction API/helper|✅|
|12|Manual redaction review page|✅|
|13|AI analysis API route|✅|
|14|Contract detail analysis display|✅|
|15|Privacy/security polish|✅|
|16|Netlify deployment|✅|
|17|README, AGENTS.md, and demo|⬜|

\---

## Step 0 — Planning \& repo setup ⏳

**Goal:** Establish the repo and planning artifacts before any application code.

**Files involved:**

* `PLAN.md`
* `BUILD\_STEPS.md`
* `.env.example`
* `.gitignore`
* `database/schema.md`
* `database/erd.md`
* `AGENTS.md`

**Verify checkpoint:**

* Repo exists on GitHub (private), `main` branch.
* All planning docs are committed and render correctly on GitHub.
* `.gitignore` excludes `.env` and `node\_modules`; `.env.example` documents required vars.

**Commit message:**

```
chore: add planning docs, env example, and database design (Step 0)
```

\---

## Step 1 — Initialize Vite + React app ⬜

**Goal:** Stand up a running React + Vite SPA.

**Files involved:**

* `package.json`, `vite.config.js`, `index.html`
* `src/main.jsx`, `src/App.jsx`

**Verify checkpoint:**

* `npm run dev` serves the app locally with no errors.
* Default route renders a placeholder Contract Compass landing screen.

**Commit message:**

```
feat: scaffold Vite + React application (Step 1)
```

\---

## Step 2 — Configure Tailwind CSS ⬜

**Goal:** Wire Tailwind into the build for utility-first styling.

**Files involved:**

* `tailwind.config.js`, `postcss.config.js`
* `src/index.css` (Tailwind directives)

**Verify checkpoint:**

* A Tailwind utility class (e.g. `text-3xl font-bold`) visibly affects the landing screen.
* No PostCSS/Tailwind build warnings.

**Commit message:**

```
feat: configure Tailwind CSS (Step 2)
```

\---

## Step 3 — Add Supabase client + env config ⬜

**Goal:** Create a single Supabase client wired to environment variables.

**Files involved:**

* `src/lib/supabaseClient.js`
* `.env` (local, ignored), `.env.example`

**Verify checkpoint:**

* Client initializes from `VITE\_SUPABASE\_URL` and `VITE\_SUPABASE\_ANON\_KEY`.
* App still boots; a quick console check confirms the client object is created.
* No keys are hardcoded anywhere in source.

**Commit message:**

```
feat: add Supabase client and environment configuration (Step 3)
```

\---

## Step 4 — Create database schema + RLS ⬜

**Goal:** Create the `contracts` table and lock it down with RLS.

**Files involved:**

* `database/schema.md` (source of truth for SQL)
* Supabase SQL editor (apply migration)

**Verify checkpoint:**

* `contracts` table exists with all columns from the data model.
* RLS is **enabled** with select/insert/update/delete policies all scoped to `auth.uid() = user\_id`.
* Manual test: a row created by user A is not visible to user B.

**Commit message:**

```
feat: add contracts schema and row level security policies (Step 4)
```

\---

## Step 5 — Registration page ⬜

**Goal:** Let new users create an account via Supabase Auth.

**Files involved:**

* `src/pages/Register.jsx`
* `src/lib/supabaseClient.js`

**Verify checkpoint:**

* Submitting email + password creates a user in Supabase Auth.
* Validation and error states (e.g. weak password, existing email) are surfaced to the user.

**Commit message:**

```
feat: add user registration page (Step 5)
```

\---

## Step 6 — Login page ⬜

**Goal:** Authenticate existing users and start a session.

**Files involved:**

* `src/pages/Login.jsx`

**Verify checkpoint:**

* Valid credentials log in and redirect to the dashboard.
* Invalid credentials show a clear error and do not navigate away.

**Commit message:**

```
feat: add login page (Step 6)
```

\---

## Step 7 — Logout + session context ⬜

**Goal:** Provide a global auth/session context and a logout action.

**Files involved:**

* `src/context/AuthContext.jsx`
* `src/App.jsx` (provider wiring)
* Nav/header component with logout button

**Verify checkpoint:**

* Session persists across page reloads.
* Logout clears the session and returns the user to login.
* Auth state is readable anywhere via the context hook.

**Commit message:**

```
feat: add session context and logout (Step 7)
```

\---

## Step 8 — Protect private routes ⬜

**Goal:** Gate authenticated pages behind a route guard.

**Files involved:**

* `src/components/ProtectedRoute.jsx`
* Router setup in `src/App.jsx`

**Verify checkpoint:**

* Visiting a protected route while logged out redirects to `/login`.
* Logged-in users reach protected routes directly.
* No flash of protected content before the redirect resolves.

**Commit message:**

```
feat: protect private routes with auth guard (Step 8)
```

\---

## Step 9 — Dashboard shell ⬜

**Goal:** Build the authenticated app layout and navigation.

**Files involved:**

* `src/pages/Dashboard.jsx`
* `src/components/Layout.jsx`, nav components

**Verify checkpoint:**

* Dashboard renders inside the protected layout with working nav.
* Shows the signed-in user and a placeholder area for the contracts list.

**Commit message:**

```
feat: add dashboard shell and layout (Step 9)
```

\---

## Step 10 — Contracts CRUD ⬜

**Goal:** Full create/read/edit/delete for contract records, scoped per user.

**Files involved:**

* `src/pages/Contracts.jsx` (list)
* `src/pages/ContractForm.jsx` (create/edit)
* `src/lib/contracts.js` (data access helpers)

**Verify checkpoint:**

* Create, list, edit, and delete all work against Supabase.
* RLS confirmed: only the owner's contracts appear.
* Delete has a confirmation step; list refreshes after each mutation.

**Commit message:**

```
feat: implement contracts CRUD (Step 10)
```

\---

## Step 11 — Auto-redaction API/helper ⬜

**Goal:** Generate a redacted draft from pasted raw text, in memory.

**Files involved:**

* `src/lib/redaction.js`

**Verify checkpoint:**

* Helper masks emails, phone numbers, SSN-like numbers, addresses, and likely names/company names with stable placeholders (e.g. `\[EMAIL]`, `\[PHONE]`, `\[NAME]`).
* Raw input is processed transiently and **never written to the database**.
* Unit-style spot checks pass on representative sample strings.

**Commit message:**

```
feat: add auto-redaction helper (Step 11)
```

\---

## Step 12 — Manual redaction review page ⬜

**Goal:** Let the user review and edit the redacted draft before analysis.

**Files involved:**

* `src/pages/RedactionReview.jsx`

**Verify checkpoint:**

* User sees the auto-redacted text in an editable field and can adjust it.
* Approving saves **only** the redacted text to `contracts.redacted\_text`.
* Original pasted text is discarded once the redacted version is approved.

**Commit message:**

```
feat: add manual redaction review page (Step 12)
```

\---

## Step 13 — AI analysis API route ⬜

**Goal:** Serverless route that sends redacted text to OpenAI and returns structured JSON.

**Files involved:**

* `netlify/functions/analyze.js`
* `netlify.toml`

**Verify checkpoint:**

* Function reads `OPENAI\_API\_KEY` from the environment (never from the client).
* Given redacted text, it returns JSON matching the agreed schema (summary, risk, deadlines, obligations, etc.).
* Invalid/empty input is rejected with a clear error; malformed AI output is handled gracefully.

**Commit message:**

```
feat: add serverless OpenAI analysis route (Step 13)
```

\---

## Step 14 — Contract detail analysis display ⬜

**Goal:** Persist and render the structured analysis for a contract.

**Files involved:**

* `src/pages/ContractDetail.jsx`
* `src/lib/contracts.js` (update with analysis fields)

**Verify checkpoint:**

* Running analysis stores the returned fields on the contract row.
* Detail view shows risk level/score, summaries, renewal/termination/payment terms, deadlines, and obligations.
* `important\_deadlines` and `obligations` render as readable lists from their jsonb arrays.

**Commit message:**

```
feat: persist and display structured contract analysis (Step 14)
```

\---

## Step 15 — Privacy/security polish ⬜

**Goal:** Verify the privacy model and remove any leaks.

**Files involved:**

* Cross-cutting (data access, redaction, function route)

**Verify checkpoint:**

* Confirm no code path stores unredacted text (DB, logs, or function payloads logged in prod).
* Secrets audit: only env vars; nothing sensitive committed; `.env` is git-ignored.
* RLS re-verified on every contract operation; error messages don't leak data.

**Commit message:**

```
chore: privacy and security hardening (Step 15)
```

\---

## Step 16 — Netlify deployment ⬜

**Goal:** Deploy the app and functions to Netlify with env config.

**Files involved:**

* `netlify.toml`
* Netlify dashboard (build settings + env vars)

**Verify checkpoint:**

* Production build succeeds; SPA routing works (no 404 on refresh of deep links).
* `VITE\_SUPABASE\_\*` and `OPENAI\_API\_KEY` set in Netlify env.
* End-to-end smoke test in prod: register → create → redact → analyze → view.

**Commit message:**

```
chore: configure Netlify deployment (Step 16)
```

\---

## Step 17 — README, AGENTS.md, and demo ⬜

**Goal:** Finalize docs and a runnable demo path.

**Files involved:**

* `README.md`
* `AGENTS.md`
* `PLAN.md` / `BUILD\_STEPS.md` (final status pass)

**Verify checkpoint:**

* README covers overview, stack, setup, env vars, run/deploy, and the privacy model.
* AGENTS.md describes the AI feature, prompt/output contract, and guardrails.
* Demo walkthrough reproduces the full flow; all build steps marked ✅.

**Commit message:**

```
docs: add README, AGENTS.md, and demo walkthrough (Step 17)
```

