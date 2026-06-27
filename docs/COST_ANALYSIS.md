# API Cost Analysis — Contract Compass

Contract Compass uses OpenAI through Netlify Functions for AI-powered contract analysis. The model is configurable with the `LLM_MODEL` environment variable. The project currently defaults to `gpt-4o-mini` in code when `LLM_MODEL` is not provided, but this document uses a conservative current mini-model estimate based on the OpenAI API pricing page.

> Pricing changes over time. The final submitted project should verify the model configured in Netlify and compare it with OpenAI's current pricing page before submission.

## AI features that use paid tokens

| Feature | Endpoint | Typical input | Typical output |
|---|---|---|---|
| Main contract analysis | `/api/analyze` | Full redacted contract | Structured JSON with summary, risk, deadlines, obligations |
| Plain-English summary | `/api/plain-english-summary` | Full redacted contract | Layperson summary |
| Explain selected clause | `/api/explain-clause` | One selected clause/excerpt | Short structured explanation |
| Missing clause detection | `/api/missing-clauses` | Full redacted contract | JSON array of potentially missing clauses |

Supabase authentication and database CRUD are not AI-token costs. Netlify hosting may have its own free-tier or usage-based limits, but the main variable cost for this project is the OpenAI API.

## Pricing assumption

OpenAI lists API prices per 1 million tokens. As of the pricing page checked on June 27, 2026, `gpt-5.4-mini` Standard pricing is listed at:

| Model | Input | Cached input | Output |
|---|---:|---:|---:|
| `gpt-5.4-mini` | $0.75 / 1M tokens | $0.075 / 1M tokens | $4.50 / 1M tokens |

This project does not rely on prompt caching for estimates. The estimates below use standard input and output rates.

## Token assumptions

These are intentionally conservative estimates for class/demo usage.

| Feature | Estimated input tokens | Estimated output tokens | Notes |
|---|---:|---:|---|
| Main contract analysis | 4,000 | 1,200 | Full redacted contract plus structured output |
| Plain-English summary | 4,000 | 600 | Full redacted contract plus concise explanation |
| Explain selected clause | 500 | 400 | One clause or short excerpt |
| Missing clause detection | 4,000 | 800 | Full redacted contract plus missing-clause JSON |

Formula:

```text
estimated cost = (input_tokens / 1,000,000 × input_price) + (output_tokens / 1,000,000 × output_price)
```

## Estimated cost per request

Using `gpt-5.4-mini` at $0.75 / 1M input tokens and $4.50 / 1M output tokens:

| Feature | Calculation | Estimated cost |
|---|---|---:|
| Main contract analysis | `(4,000 × $0.75 / 1M) + (1,200 × $4.50 / 1M)` | `$0.0084` |
| Plain-English summary | `(4,000 × $0.75 / 1M) + (600 × $4.50 / 1M)` | `$0.0057` |
| Explain selected clause | `(500 × $0.75 / 1M) + (400 × $4.50 / 1M)` | `$0.0022` |
| Missing clause detection | `(4,000 × $0.75 / 1M) + (800 × $4.50 / 1M)` | `$0.0066` |

Estimated total if a user runs all four AI features once on one contract:

```text
$0.0084 + $0.0057 + $0.0022 + $0.0066 = $0.0229 per fully analyzed contract
```

## Usage scenarios

| Scenario | Assumption | Estimated cost |
|---|---|---:|
| Demo use | 5 contracts, all four AI features once | About `$0.11` |
| Small class test | 25 contracts, all four AI features once | About `$0.57` |
| 100 contracts | 100 contracts, all four AI features once | About `$2.29` |
| 1,000 contracts | 1,000 contracts, all four AI features once | About `$22.90` |

## Cost controls

The project includes or can support these cost-control measures:

- AI is only triggered when the user clicks an action button.
- Contract CRUD does not call the AI API.
- Clause explanations are generated on demand and are not automatically run for every clause.
- Missing clause detection is separate from the main analysis and only runs when requested.
- The model is configurable with `LLM_MODEL`, allowing a lower-cost mini model for demos.
- Netlify environment variables keep the API key server-side and allow quick key rotation if needed.

## Risks and limitations

- Longer contracts will cost more because input token count increases.
- Re-running analysis repeatedly on the same contract increases cost.
- If a more expensive model is configured in `LLM_MODEL`, the estimates above will be too low.
- If the model returns unusually long outputs, output-token costs increase.
- Pricing may change, so the official pricing page should be checked before final submission.

## Summary

For the expected Week 3 mini-project usage, the AI cost is very small. A full demo using several contracts should cost well under one dollar, and even 100 full contract analyses with all AI features would be roughly a few dollars under the assumptions above.
