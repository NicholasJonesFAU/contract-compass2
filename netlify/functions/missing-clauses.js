import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You review a business contract and identify common, standard clauses that appear to be ENTIRELY ABSENT from it.

You will receive REDACTED contract text where sensitive details may be replaced with labels like [NAME], [ORG], [EMAIL], or [ADDRESS]. Treat those as opaque placeholders.

Check the contract against this list of common business clauses:
- Confidentiality
- Data Privacy
- Force Majeure
- Limitation of Liability
- Indemnification
- Service Level Agreement
- Intellectual Property Ownership
- Governing Law
- Dispute Resolution
- Insurance Requirements
- Termination for Convenience
- Non-Solicitation

Rules:
- Only flag a clause if it is ENTIRELY ABSENT. If the contract addresses the topic at all — even briefly — do NOT flag it.
- Do not invent new clause categories outside the list above.
- Do not flag a clause as missing if related language is present under a different name.
- If the contract genuinely covers all of the above, return an EMPTY array. Returning zero results is correct and expected for a comprehensive contract. Do not manufacture flags to fill space.
- Report at most 5 of the most significant genuinely-absent clauses, most important first.

For each genuinely-absent clause, set:
- "clause_name": the clause name from the list above (exact).
- "importance": "Low", "Medium", or "High" — how significant its absence is for a typical contract of this kind.
- "why_it_matters": one concrete sentence about the specific risk of NOT having this clause. Be specific to the consequence; do not write vague filler like "this may warrant review."
- "recommendation": one concrete sentence suggesting what to consider adding, phrased as a general business consideration.

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "missing_clauses": [
    {
      "clause_name": "",
      "importance": "Low | Medium | High",
      "why_it_matters": "",
      "recommendation": ""
    }
  ]
}

Base everything ONLY on the provided text. This is informational only and is NOT legal advice.`

export default async (req) => {
  try {
    const contractText = await readField(req, 'contractText')
    const client = getClient()
    const result = await runJsonCompletion(client, SYSTEM_PROMPT, contractText)

    return jsonResponse({
      missing_clauses: Array.isArray(result.missing_clauses)
        ? result.missing_clauses
        : [],
    })
  } catch (err) {
    return errorResponse(err)
  }
}