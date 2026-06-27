# README Additions

Paste these sections into `README.md` after the existing Core Features / Architecture sections, or near the end before Limitations.

## AI features

Contract Compass includes four distinct AI-powered features. Each feature is triggered intentionally by the user and receives only redacted contract text or a selected redacted clause.

| Feature | Endpoint | Purpose |
|---|---|---|
| Contract Analysis | `/api/analyze` | Extracts structured risk, renewal, termination, payment, deadline, and obligation data |
| Plain-English Summary | `/api/plain-english-summary` | Rewrites the contract in non-lawyer-friendly language |
| Explain a Clause | `/api/explain-clause` | Explains a selected clause, why it matters, risks, and recommended action |
| Missing Clause Detection | `/api/missing-clauses` | Identifies common business clauses that appear to be absent |

These are not chatbot wrappers. They are task-specific AI workflows that return structured outputs.

## Project deliverables

| Deliverable | Link |
|---|---|
| API documentation | [`docs/API.md`](docs/API.md) |
| Test cases | [`docs/TEST_CASES.md`](docs/TEST_CASES.md) |
| API cost analysis | [`docs/COST_ANALYSIS.md`](docs/COST_ANALYSIS.md) |
| Demo guide | [`DEMO.md`](DEMO.md) |
| Demo video | TODO: add video link |

## API documentation and testing

The custom AI endpoints are documented in [`docs/API.md`](docs/API.md). Manual test cases for authentication, CRUD, protected routes, AI endpoints, privacy behavior, deployment, and error handling are documented in [`docs/TEST_CASES.md`](docs/TEST_CASES.md).

A Postman collection is included at [`docs/ContractCompass.postman_collection.json`](docs/ContractCompass.postman_collection.json) for testing the serverless AI endpoints.

## Cost analysis

A cost estimate for AI API usage is documented in [`docs/COST_ANALYSIS.md`](docs/COST_ANALYSIS.md). The project uses a configurable `LLM_MODEL` environment variable, so the final cost depends on the model selected in Netlify.
