# Demo Video Script — Contract Compass (3–5 minutes)

A tight, rubric-driven script for the Week 3 demo video. Each section maps to a requirement the graders are looking for. Aim for ~4 minutes. Record at the live site: https://contract-compassnj.netlify.app/

> Tip: have the sample contract (bottom of this file) copied to your clipboard before you start recording.

---

## 0:00 — Intro (15 sec)

> "This is Contract Compass, a privacy-conscious contract analysis app. It lets you paste a contract, automatically redact sensitive information, and run five different AI features on it — without ever storing the original unredacted text. Built with React, Vite, Tailwind, Supabase, and Netlify functions calling the OpenAI API."

## 0:15 — Auth & protected routes (30 sec)

- Show you're logged out. Type `/dashboard` in the URL bar → it redirects to login.
- > "Routes are protected — unauthenticated users can't reach the app."
- Register or log in.
- > "Authentication is handled by Supabase, with a session that persists across reloads."

## 0:45 — Create + redaction (45 sec)

- Click New Contract. Paste the sample contract.
- Click "Redact & review."
- > "The original text was redacted in the browser. Emails, phones, SSNs, names, and organizations are replaced with labels — and the original is discarded, never saved."
- Point at a label or two. Manually fix one thing the regex missed.
- Save.
- > "Only this redacted version is stored."

## 1:30 — Prove privacy (20 sec)

- Open Supabase Table Editor → the row → show `redacted_text` has labels, not raw PII.
- > "There's no column for unredacted text. The original never reaches the database."

## 1:50 — AI Feature 1: Analysis (30 sec)

- Open the contract → click Analyze.
- > "Feature one: structured contract analysis. The redacted text goes to a serverless function — never the browser — and comes back as structured JSON: risk score, auto-renewal, payment and termination terms, deadlines, and obligations."
- Reload → "And it persists."

## 2:20 — AI Feature 2: Plain-English Summary (20 sec)

- Click Generate Plain-English Summary.
- > "Feature two explains the contract in plain language for a non-lawyer — what it does, how to cancel, the major risks."

## 2:40 — AI Feature 3: Explain a Clause (25 sec)

- Scroll to Explain a Clause. Paste the termination clause.
- > "Feature three: paste any clause and get a plain explanation, why it matters, the risks, and a recommended action. This one is generated on demand and not saved."

## 3:05 — AI Feature 4: Privacy Review (30 sec)

- Click Find Additional Sensitive Information.
- > "Feature four is a second AI privacy pass — it scans the already-redacted text for things the regex missed, like company or personal names. Crucially, nothing is auto-applied: I approve each redaction manually."
- Click Redact on one suggestion.

## 3:35 — AI Feature 5: Missing Clauses (25 sec)

- Click Analyze Missing Clauses.
- > "Feature five flags common business clauses that appear to be missing — like limitation of liability or governing law — with importance levels. This is informational only, not legal advice."

## 4:00 — Security & error handling (20 sec)

- Open DevTools → Network → trigger any AI feature.
- > "Every AI call goes to my own serverless function, not to OpenAI directly — so the API key is never exposed to the browser. The functions handle errors, empty input, and rate limits gracefully."

## 4:20 — Wrap (15 sec)

- > "Per-user data is isolated with Row Level Security, the app is deployed on Netlify with CI/CD on every push, and the repo includes full API docs, a Postman collection, test cases, and a cost analysis. Thanks for watching."

---

## Sample contract (copy before recording)

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
