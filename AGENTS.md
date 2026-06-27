# AGENTS.md — Contract Compass

This document describes the AI component of Contract Compass: what it does, how it is invoked, the input/output contract, and the guardrails around it.

## What the AI does

Contract Compass uses a single **structured-extraction** AI feature — **not a chatbot**. Given the user-approved **redacted** contract text, the AI returns a fixed-shape JSON object describing the contract's summary, risk, key terms, deadlines, and obligations. There is no open-ended conversation and no freeform generation outside the schema.

## Where it runs

- The AI call happens **server-side only**, inside a Netlify serverless function (`netlify/functions/analyze.js`).
- The API key is read from the function's environment (`OPENAI_API_KEY`) and is **never** exposed to the browser.
- The client calls `/.netlify/functions/analyze` with the redacted text; the function calls the model and returns parsed JSON.

## Model

- Default model: `gpt-4o-mini` (overridable via the `LLM_MODEL` env var).
- The function uses the OpenAI SDK and can target any OpenAI-compatible endpoint via an optional `OPENAI_BASE_URL`, so the provider can be swapped without code changes.
- Temperature is set low (`0.2`) for consistent, extraction-style output.

## Input contract

The function accepts:

```json
{ "redacted_text": "string (already redacted and user-approved)" }
```

- Input must be non-empty redacted text. Empty or missing input is rejected with a `400`.
- Redaction has already happened client-side and been approved by the user. The function never receives raw unredacted text.

## Output contract

The model is instructed (via `response_format: { type: "json_object" }`) to return JSON in exactly this shape:

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

Each field maps directly to a column on the `contracts` table. `important_deadlines` and `obligations` are stored as `jsonb`.

## Prompt design

The system prompt instructs the model to:

- Act as a contract analysis extractor that outputs **only** valid JSON in the schema above — no markdown, no prose.
- Treat redaction labels (`[NAME]`, `[ORG]`, etc.) as opaque placeholders and analyze around them.
- Base analysis solely on the provided text, using empty strings / empty arrays when information is absent rather than inventing details.
- Keep `risk_score` an integer 1–10 consistent with `risk_level`.

## Guardrails

- **No raw text:** the AI only ever receives redacted, user-approved text.
- **Server-only key:** the key is read from the function environment; never bundled into client code or prefixed with `VITE_`.
- **Validation:** the function parses the model's response as JSON and returns a `502` if it is not valid JSON, rather than passing malformed output through.
- **Graceful failure:** bad method, invalid body, empty input, missing key, and API errors all return clear status codes and messages.
- **Not legal advice:** outputs are informational extractions, not legal advice.

## Files

- `netlify/functions/analyze.js` — serverless handler that calls the model and returns validated JSON.
- `src/lib/contracts.js` — `analyzeContract` (calls the function) and `saveAnalysis` (persists results).
- `src/pages/ContractDetail.jsx` — renders the structured analysis.
