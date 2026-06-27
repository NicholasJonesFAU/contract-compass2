# Demo Walkthrough — Contract Compass

A step-by-step script for demonstrating Contract Compass, mapped to the class requirements it proves. Live app: https://contract-compassnj.netlify.app/

Total demo time: ~5 minutes.

---

## 1. Registration & auth (proves: Supabase Auth)

1. Open the live URL — you land on the login page.
2. Click **Create one** → register a new account (e.g. `demo@example.com`).
3. You are signed in immediately and land on the dashboard.

**Talking point:** Supabase Auth with persisted sessions; email confirmation disabled for demo smoothness.

## 2. Protected routes (proves: protected routes)

1. Click **Sign out**.
2. Manually navigate to `/dashboard` in the URL bar.
3. You are redirected to `/login`.

**Talking point:** the `ProtectedRoute` wrapper checks the session before rendering; unauthenticated access is impossible.

## 3. Create & redact a contract (proves: CRUD, auto-redaction, privacy)

1. Log back in. Click **New Contract**.
2. Give it a title and paste a contract containing PII (use the sample below).
3. Click **Redact & review**.
4. Point out the labels: `[EMAIL]`, `[PHONE]`, `[SSN]`, `[ORG]`, etc., and the "Auto-redacted N items" banner.
5. Manually edit one thing the auto-pass missed (e.g. a bare name), to show the human-in-the-loop step.
6. Click **Save contract**.

**Talking point:** raw text was redacted in the browser and discarded; only the redacted version is saved.

## 4. Prove nothing raw is stored (proves: privacy-first storage)

1. Open the Supabase Table Editor → `contracts` table → the row you just created.
2. Show that `redacted_text` contains labels, **not** the original email/phone/SSN.

**Talking point:** there is no column for unredacted text; the original never reaches the database. (Keep a screenshot of this for submission.)

## 5. AI analysis (proves: AI structured extraction)

1. Back in the app, open the contract → click **Analyze**.
2. The structured result renders: risk badge + score, summary, plain-English summary, key terms, deadlines, obligations.
3. Reload the page — the analysis persists.

**Talking point:** only the redacted text was sent to the AI, server-side via a Netlify function; the result is structured JSON, not a chatbot.

## 6. Key never exposed (proves: secrets in env only)

1. Open DevTools → Network → click **Re-analyze**.
2. Show the request goes to `/.netlify/functions/analyze`, not `api.openai.com`.
3. Search the page source for `sk-` — nothing.

**Talking point:** the OpenAI key lives only in the serverless function's server-side environment.

## 7. Per-user isolation (proves: RLS)

1. Sign out, register a **second** account.
2. The new account's dashboard is empty — it cannot see the first account's contracts.
3. Sign back into the first account → its contracts are still there.

**Talking point:** isolation is enforced by Postgres Row Level Security at the database layer, not just app logic.

## 8. CI/CD (proves: deployment, meaningful git history)

1. Show the GitHub repo — conventional commit history, one commit per build step.
2. Note that every push to `main` auto-deploys to Netlify.

---

## Sample contract for the demo

```
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of March 1, 2026, by and between Brightline Analytics LLC ("Provider"), and Coastal Retail Group Inc. ("Client").

Primary contact for Provider: Mr. James Holloway, james.holloway@brightlineanalytics.com, (561) 555-0142. Client billing contact: Ms. Dana Reyes, 400 Seabreeze Boulevard, Suite 210, Fort Lauderdale, FL 33301, dreyes@coastalretail.com. Client tax ID on file: 123-45-6789.

1. TERM. This Agreement begins on March 1, 2026 and continues for an initial term of twelve (12) months. The Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

2. FEES AND PAYMENT. Client shall pay Provider a monthly fee of $8,500, due within thirty (30) days of each invoice date. Late payments accrue interest at 1.5% per month.

3. PROVIDER OBLIGATIONS. Provider shall deliver monthly analytics reports by the fifth (5th) business day of each month and maintain 99.5% platform uptime. Provider shall notify Client of any data breach within seventy-two (72) hours of discovery.

4. CLIENT OBLIGATIONS. Client shall provide Provider with access to relevant sales data within ten (10) business days of the effective date.

5. TERMINATION. Either party may terminate this Agreement for material breach if such breach is not cured within thirty (30) days of written notice. Client may terminate for convenience with ninety (90) days written notice.
```

This sample is built to exercise every analysis field: it has named parties, an auto-renewal clause, payment terms, termination terms, deadlines, and obligations on both sides — plus PII (emails, phone, address, SSN) to demonstrate redaction.
