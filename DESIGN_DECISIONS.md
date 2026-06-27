# Design Decisions — Contract Compass

A short record of the non-obvious choices made while building Contract Compass, and why. Useful context for evaluating the project beyond "does it work."

## 1. Privacy enforced in code, not just intention

The core requirement is "do not store original unredacted contract text." Rather than relying on a policy, this is enforced structurally:

- The database has **no column** for raw text, so there is nowhere to store it even by accident.
- Raw pasted text lives only in a single React component's local state and is **cleared the instant redaction runs** (`setRawText('')`).
- Because raw text is discarded immediately, there is no "back" button in the flow — only "Start over," which intentionally begins from an empty state. You cannot return to text that no longer exists.

## 2. Redaction review folded into the contract form, not a separate page

The original plan had a standalone `RedactionReview` page. It was instead implemented as a two-stage flow (paste → review) inside `ContractForm`.

**Reason:** a separate routed page would require passing the raw text between routes via React Router navigation state or a shared store — which puts raw PII into router history, i.e. *another surface holding unredacted text.* Keeping the flow in one component means raw text never leaves that component's memory. For a privacy-first app, minimizing the number of places raw text can live is the stronger design.

## 3. Conservative redaction + human review, not "perfect" redaction

Redaction uses regex/heuristics. Structured patterns (emails, phones, SSNs) catch reliably. Fuzzy patterns (names, organizations, addresses) are deliberately **conservative**.

**Reason:** this app sends redacted text to an AI for analysis. Over-aggressive redaction that masks normal contract language ("Agreement," "Effective Date," "Company") would destroy the very text the AI needs, making the analysis useless. Under-redaction is caught by the mandatory human review step. So the design optimizes for "catch the high-confidence PII automatically, let a human catch the rest" rather than chasing an impossible perfect automated redactor.

## 4. GRANT and RLS are both required

Creating the `contracts` table via raw SQL (rather than the Supabase Table Editor) did not auto-grant table access to the `authenticated` role, producing a "permission denied for table" error even with RLS policies in place.

**The distinction:** `GRANT` controls whether a role may touch the table at all; `RLS` controls which rows it may touch. Both are necessary. The schema now includes an explicit `grant select, insert, update, delete on public.contracts to authenticated`, with RLS policies layered on top.

## 5. The AI key never touches the browser

AI analysis runs in a Netlify serverless function, not a client-side `fetch` to OpenAI.

**Reason:** any API key in frontend code is visible to anyone who opens devtools. The browser calls `/.netlify/functions/analyze`; only the function (server-side) holds `OPENAI_API_KEY` and calls OpenAI. The key is never prefixed with `VITE_` (the prefix that would expose it to the bundle) and is set in the Netlify dashboard, never committed.

## 6. Structured extraction, not a chatbot

The AI feature returns a fixed JSON schema (`response_format: { type: "json_object" }`) mapping directly to database columns, rather than a conversational interface.

**Reason:** the class requirement is structured extraction. It is also more useful here — the output is queryable, displayable as formatted cards, and persisted as typed fields, rather than a wall of chat text. Low temperature (0.2) keeps extraction consistent.

## 7. Provider-agnostic AI function

The function reads model, base URL, and key from environment variables and uses the OpenAI SDK's `baseURL` option.

**Reason:** this allows swapping to any OpenAI-compatible endpoint (e.g. a university-hosted proxy, or a local model) by changing environment variables only, with no code change. It also future-proofs against provider changes.

## 8. JSONB for deadlines and obligations

`important_deadlines` and `obligations` are stored as `jsonb` arrays rather than normalized child tables.

**Reason:** for a single-row read/write per contract, jsonb matches the AI's structured output directly and avoids joins. The trade-off is acknowledged: if the app grew to need querying across all deadlines (e.g. "show every deadline this month across all contracts"), these would be normalized into separate tables.

## 9. Email confirmation disabled

Supabase email confirmation is turned off, so registration produces an immediate session.

**Reason:** for a class demo, the confirmation email is friction and a rate-limit risk during a live presentation. In a production deployment this would be re-enabled.
