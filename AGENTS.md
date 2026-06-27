# AGENTS.md — Contract Compass

This document describes the AI component of Contract Compass: what it does, how it is invoked, the strict input/output contract, and the guardrails around it. It is the reference for anyone (human or coding agent) working on the analysis feature.

## What the AI does

Contract Compass uses a single **structured-extraction** AI feature — **not a chatbot**. Given the user-approved **redacted** contract text, the AI returns a fixed-shape JSON object describing the contract's summary, risk, key terms, deadlines, and obligations. There is no open-ended conversation, no follow-up turns, and no freeform generation outside the schema.

## Where it runs

- The AI call happens **server-side only**, inside a Netlify serverless function (`netlify/functions/analyze.js`).
- The `OPENAI_API_KEY` lives in the function's environment and is **never** exposed to the browser.
- The client sends only the redacted text to the function; the function calls OpenAI and returns parsed JSON.

## Input contract

The function accepts:

```json
{ "redacted_text": "string (already redacted and user-approved)" }
```

- Input must be non-empty redacted text. The function rejects empty/missing input.
- The function assumes redaction has already happened on the client and been approved by the user. It does not receive or handle raw unredacted text.

## Output contract

The model is instructed to return JSON in **exactly** this shape (JSON mode / response_format enforced where available):

```json
{
  "summary": "",
  "plain_english_summary": "",
  "risk_level": "Low | Medium | High",
  "risk_score": 1,
  "auto_renewal": false,
  "renewal_terms": "",
  "termination_terms": "",
  "payment_terms": "",
  "important_deadlines": [
    {
      "deadline_type": "",
      "description": "",
      "date_or_trigger": "",
      "importance": "Low | Medium | High"
    }
  ],
  "obligations": [
    {
      "party": "",
      "obligation": "",
      "deadline_or_frequency": "",
      "risk_if_missed": ""
    }
  ]
}
```

Field expectations:
- `risk_level` is one of `Low`, `Medium`, `High`.
- `risk_score` is an integer 1–10.
- `auto_renewal` is a boolean.
- `important_deadlines` and `obligations` are arrays (possibly empty) of the objects above.
- Each output field maps directly to a column on the `contracts` table.

## Prompt design (guidance)

The system prompt should:
- Define the model's role as a contract analysis extractor that outputs **only** valid JSON in the schema above — no prose, no markdown fences.
- Instruct it to base its analysis solely on the provided text and to use empty strings / empty arrays when information is absent rather than inventing details.
- Ask it to flag uncertainty inside the relevant text fields rather than fabricating dates, parties, or amounts.

## Guardrails

- **No raw text:** the AI only ever receives redacted text. Raw contract text is never sent, stored, or logged.
- **Server-only key:** the OpenAI key is read from the function environment; it is never bundled into client code or prefixed with `VITE_`.
- **Schema validation:** the function parses and validates the model's JSON before returning it. Malformed output is rejected/retried rather than passed through blindly.
- **Graceful failure:** empty input, API errors, and unparseable responses return clear error states; the UI never silently shows stale or partial analysis.
- **Not legal advice:** outputs are informational extractions, not legal advice. The UI should make this clear to users.
- **Determinism preference:** a low temperature is preferred for consistent, extraction-style output.

## Files

- `netlify/functions/analyze.js` — serverless handler that calls OpenAI and returns validated JSON.
- `src/lib/contracts.js` — persists the returned fields to the `contracts` row.
- `src/pages/ContractDetail.jsx` — renders the structured analysis.
