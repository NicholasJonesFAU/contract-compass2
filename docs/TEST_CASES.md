# Test Cases — Contract Compass

These test cases cover the required project areas: authentication, protected routes, database CRUD, AI endpoints, error handling, privacy behavior, and edge cases.

## Test environment

| Item | Value |
|---|---|
| Local URL | `http://localhost:8888` via `netlify dev` |
| Production URL | `https://contract-compassnj.netlify.app` |
| Browser | Chrome / Edge / Firefox |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| AI Provider | OpenAI API via Netlify Functions |

## Authentication tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| AUTH-01 | Register | Create new account | Go to `/register`, enter a new email/password, submit | User account is created and app redirects/logs in as expected | ⬜ |
| AUTH-02 | Register | Duplicate account | Register with an email that already exists | User-friendly error appears | ⬜ |
| AUTH-03 | Login | Valid login | Go to `/login`, enter valid credentials | User redirects to dashboard | ⬜ |
| AUTH-04 | Login | Invalid password | Enter valid email with wrong password | Error is shown and user remains logged out | ⬜ |
| AUTH-05 | Logout | End session | Click logout from the app layout | Session clears and user returns to login | ⬜ |
| AUTH-06 | Session persistence | Refresh while logged in | Login, refresh browser on dashboard | User remains authenticated | ⬜ |

## Protected route tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| ROUTE-01 | Protected routes | Dashboard while logged out | Open `/dashboard` in a logged-out browser | Redirects to `/login` | ⬜ |
| ROUTE-02 | Protected routes | New contract while logged out | Open `/contracts/new` logged out | Redirects to `/login` | ⬜ |
| ROUTE-03 | Protected routes | Contract detail while logged out | Open `/contracts/:id` logged out | Redirects to `/login` | ⬜ |
| ROUTE-04 | Protected routes | Private route while logged in | Login, open dashboard/contracts route | Page loads successfully | ⬜ |

## Contract CRUD tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| CRUD-01 | Create | Create a contract | Login, click new contract, paste sample text, review redaction, save | Contract is saved and appears on dashboard | ⬜ |
| CRUD-02 | Create validation | Empty title | Try to save a contract with no title | Validation or error prevents bad save | ⬜ |
| CRUD-03 | Create validation | Empty contract text | Try to save with blank contract text | Validation or error prevents bad save | ⬜ |
| CRUD-04 | Read | Dashboard list | Create two contracts and return to dashboard | Both contracts are listed for current user | ⬜ |
| CRUD-05 | Read | Contract detail | Click a saved contract | Detail page loads correct contract data | ⬜ |
| CRUD-06 | Update | Edit title/text | Edit a saved contract title or redacted text | Updates persist after refresh | ⬜ |
| CRUD-07 | Delete | Delete contract | Delete a saved contract | Contract disappears from dashboard and cannot be opened | ⬜ |
| CRUD-08 | RLS isolation | Different user data | Login as user B after user A creates a contract | User B cannot see user A's contract | ⬜ |

## Redaction and privacy tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| PRIV-01 | Auto-redaction | Email redaction | Paste text with `john@example.com` | Email becomes `[EMAIL]` | ⬜ |
| PRIV-02 | Auto-redaction | Phone redaction | Paste text with `(555) 123-4567` | Phone becomes `[PHONE]` | ⬜ |
| PRIV-03 | Auto-redaction | SSN-like redaction | Paste text with `123-45-6789` | SSN-like value becomes `[SSN]` | ⬜ |
| PRIV-04 | Manual review | Edit redacted draft | Modify redacted text before saving | Edited redacted version is saved | ⬜ |
| PRIV-05 | Storage privacy | Raw text not stored | Inspect Supabase contract row after save | Only `redacted_text` exists; no raw/original text column | ⬜ |
| PRIV-06 | AI privacy | AI uses redacted text | Analyze a contract containing redaction labels | AI output works with labels and does not require raw values | ⬜ |

## AI endpoint tests

| ID | Endpoint | Test | Request | Expected result | Status |
|---|---|---|---|---|---|
| AI-01 | `/api/analyze` | Valid contract analysis | `POST` with `redacted_text` | Returns summary, risk, key terms, deadlines, obligations | ⬜ |
| AI-02 | `/api/analyze` | Empty payload | `POST {}` | `400` with `redacted_text is required` | ⬜ |
| AI-03 | `/api/analyze` | Invalid method | `GET` request | `405 Method not allowed` | ⬜ |
| AI-04 | `/api/plain-english-summary` | Valid summary | `POST` with `contractText` | Returns `plain_english_summary` | ⬜ |
| AI-05 | `/api/plain-english-summary` | Empty contract | `POST { "contractText": "" }` | `400` with `contractText is required` | ⬜ |
| AI-06 | `/api/explain-clause` | Valid clause | `POST` with `clauseText` | Returns explanation, why it matters, risks, action | ⬜ |
| AI-07 | `/api/explain-clause` | Empty clause | `POST { "clauseText": "" }` | `400` with `clauseText is required` | ⬜ |
| AI-08 | `/api/missing-clauses` | Valid contract | `POST` with `contractText` | Returns `missing_clauses` array | ⬜ |
| AI-09 | `/api/missing-clauses` | Empty contract | `POST { "contractText": "" }` | `400` with `contractText is required` | ⬜ |
| AI-10 | AI error handling | Missing API key local test | Temporarily remove `OPENAI_API_KEY` locally and call AI endpoint | `500` with server config error | ⬜ |
| AI-11 | AI error handling | Rate limit | Simulate or encounter OpenAI 429 | User sees: `AI service is temporarily busy. Please try again in a moment.` | ⬜ |

## UI loading and error-state tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| UI-01 | Contract analysis | Loading state | Click Analyze | Button/page shows `Analyzing...` until complete | ⬜ |
| UI-02 | Plain-English summary | Loading state | Click Generate Plain-English Summary | Shows `Generating Summary...` | ⬜ |
| UI-03 | Clause explainer | Loading state | Click Explain This Clause | Shows loading state while endpoint runs | ⬜ |
| UI-04 | Missing clauses | Loading state | Click Analyze Missing Clauses | Shows `Analyzing Missing Clauses...` | ⬜ |
| UI-05 | Error display | AI endpoint error | Submit invalid/empty text | Friendly error is visible to user | ⬜ |

## Deployment tests

| ID | Feature | Test | Steps | Expected result | Status |
|---|---|---|---|---|---|
| DEPLOY-01 | Public URL | App loads | Open production URL | App loads without local dependencies | ⬜ |
| DEPLOY-02 | Auth in production | Register/login | Register or login on production URL | Auth works | ⬜ |
| DEPLOY-03 | Functions in production | AI endpoint | Analyze a contract on production URL | Netlify function runs and returns AI output | ⬜ |
| DEPLOY-04 | SPA routing | Refresh private route | Open a contract detail route and refresh | Route does not 404 | ⬜ |
| DEPLOY-05 | Secrets | Env vars | Confirm Netlify env vars are set and `.env` is not committed | Secrets are not exposed in repo | ⬜ |

## Manual demo checklist

Use this sequence for the 3–5 minute demo video:

1. Register or log in.
2. Create a new contract.
3. Show auto-redaction and manual redaction review.
4. Save the contract.
5. Run the main AI contract analysis.
6. Generate a plain-English summary.
7. Explain a selected clause.
8. Analyze missing clauses.
9. Show dashboard listing and risk indicator.
10. Delete or edit a contract.
