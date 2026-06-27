# API Documentation — Contract Compass

Contract Compass uses Supabase directly from the frontend for authentication and contract CRUD, and Netlify Functions for AI-powered endpoints. Netlify rewrites `/api/*` to `/.netlify/functions/*` in `netlify.toml`, so the documented API paths use the cleaner `/api/...` format.

Base URL examples:

- Local: `http://localhost:8888`
- Production: `https://contract-compassnj.netlify.app`

All AI endpoints accept and return JSON.

```http
Content-Type: application/json
```

## Error format

All serverless AI endpoints return errors in this shape:

```json
{
  "error": "Human-readable error message"
}
```

Common statuses:

| Status | Meaning |
|---|---|
| `400` | Missing or invalid request body |
| `405` | Method not allowed; endpoint requires `POST` |
| `429` | AI provider rate limit or temporary capacity issue |
| `500` | Server configuration problem, such as missing `OPENAI_API_KEY` |
| `502` | AI provider failure or model returned invalid JSON |

For rate limits, the user-facing message should be:

```json
{
  "error": "AI service is temporarily busy. Please try again in a moment."
}
```

---

## AI endpoints

### POST `/api/analyze`

Runs the main structured contract analysis. This endpoint receives only redacted contract text.

Source file: `netlify/functions/analyze.js`

#### Request

```json
{
  "redacted_text": "This Agreement shall automatically renew for successive one-year terms unless either party gives sixty (60) days written notice."
}
```

#### Success response `200`

```json
{
  "summary": "This agreement renews automatically for one-year terms unless notice is provided before expiration.",
  "plain_english_summary": "This contract keeps renewing each year unless someone cancels it in writing before the deadline.",
  "risk_level": "Medium",
  "risk_score": 6,
  "auto_renewal": true,
  "renewal_terms": "Automatically renews for successive one-year terms.",
  "termination_terms": "Either party must provide written notice at least 60 days before the current term expires.",
  "payment_terms": "",
  "important_deadlines": [
    {
      "deadline_type": "Termination notice",
      "description": "Written notice is required to avoid automatic renewal.",
      "date_or_trigger": "At least 60 days before expiration of the then-current term",
      "importance": "High"
    }
  ],
  "obligations": [
    {
      "party": "Either party",
      "obligation": "Provide written notice to terminate before renewal.",
      "deadline_or_frequency": "60 days before term expiration",
      "risk_if_missed": "The agreement may renew for another one-year term."
    }
  ]
}
```

#### Validation errors

Missing text:

```json
{
  "error": "redacted_text is required"
}
```

Invalid JSON:

```json
{
  "error": "Invalid JSON body"
}
```

---

### POST `/api/plain-english-summary`

Generates a separate layperson-friendly explanation of a redacted contract.

Source file: `netlify/functions/plain-english-summary.js`

#### Request

```json
{
  "contractText": "This Agreement shall automatically renew for successive one-year terms unless either party gives sixty (60) days written notice."
}
```

#### Success response `200`

```json
{
  "plain_english_summary": "This contract renews automatically each year. If either side wants to stop it from renewing, they need to send written notice at least 60 days before the current term ends. The biggest thing to watch is the notice deadline, because missing it could lock the parties into another year."
}
```

#### Validation error

```json
{
  "error": "contractText is required"
}
```

---

### POST `/api/explain-clause`

Explains a single clause or selected excerpt. This is generated on demand and is not saved to the database.

Source file: `netlify/functions/explain-clause.js`

#### Request

```json
{
  "clauseText": "The Customer agrees to indemnify and hold harmless the Company from any and all claims, damages, liabilities, and expenses arising out of the Customer's use of the Services."
}
```

#### Success response `200`

```json
{
  "plain_explanation": "The customer agrees to protect the company from legal claims or costs connected to the customer's use of the services.",
  "why_it_matters": "This can shift financial responsibility from the company to the customer.",
  "possible_risks": "The customer could be responsible for legal fees, damages, or settlement costs if a claim arises.",
  "recommended_action": "Consider reviewing whether the responsibility is reasonable and whether the language is too broad."
}
```

#### Validation error

```json
{
  "error": "clauseText is required"
}
```

---

### POST `/api/missing-clauses`

Reviews the redacted contract text and identifies common business clauses that appear to be absent.

Source file: `netlify/functions/missing-clauses.js`

#### Request

```json
{
  "contractText": "This Agreement provides software services for a monthly fee. Either party may terminate with thirty days written notice."
}
```

#### Success response `200`

```json
{
  "missing_clauses": [
    {
      "clause_name": "Confidentiality",
      "importance": "Medium",
      "why_it_matters": "The agreement may involve business information but does not describe how confidential information should be protected.",
      "recommendation": "Consider whether a confidentiality section should be added."
    },
    {
      "clause_name": "Limitation of Liability",
      "importance": "High",
      "why_it_matters": "Without this clause, potential liability may be broader than intended.",
      "recommendation": "Consider whether the contract should define limits on damages or liability."
    }
  ]
}
```

If no meaningful gaps are detected, the endpoint returns an empty array:

```json
{
  "missing_clauses": []
}
```

#### Validation error

```json
{
  "error": "contractText is required"
}
```

---

## Supabase Auth and CRUD operations

Authentication and contract CRUD are performed through the Supabase client rather than custom API routes.

Source files:

- `src/context/AuthContext.jsx`
- `src/lib/contracts.js`
- `src/lib/supabaseClient.js`

### Auth operations

| Action | Supabase method | Notes |
|---|---|---|
| Register | `supabase.auth.signUp()` | Creates a new account |
| Login | `supabase.auth.signInWithPassword()` | Authenticates existing users |
| Logout | `supabase.auth.signOut()` | Clears current session |
| Session restore | `supabase.auth.getSession()` / auth state listener | Persists login on refresh |

### Contract CRUD operations

| Action | Table | Supabase operation |
|---|---|---|
| List contracts | `contracts` | `select('id, title, risk_level, created_at, updated_at')` |
| Get one contract | `contracts` | `select('*').eq('id', id).single()` |
| Create contract | `contracts` | `insert({ title, redacted_text, user_id })` |
| Update contract | `contracts` | `update(fields).eq('id', id)` |
| Delete contract | `contracts` | `delete().eq('id', id)` |

Access control is enforced by Supabase Row Level Security. Users can only select, insert, update, or delete rows where `auth.uid() = user_id`.

---

## Privacy and security notes

- Original unredacted contract text is not stored in the database.
- AI endpoints should receive only redacted text or selected redacted clauses.
- The OpenAI API key is stored server-side in Netlify environment variables.
- The frontend never receives or exposes the OpenAI API key.
- The application is educational and informational only; AI outputs are not legal advice.
