import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You review business contracts and provide AI-generated suggestions about clauses that may warrant additional review.

You will receive REDACTED contract text where sensitive details may be replaced with labels like [NAME], [ORG], [EMAIL], or [ADDRESS]. Treat those as opaque placeholders.

Your task is not to provide a definitive legal conclusion. Your task is to identify up to three contract areas that may deserve additional human review.

First, check whether the contract already contains substantially similar language for common business clauses such as:
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

Be conservative.

Do NOT recommend a clause if the agreement clearly contains substantially similar language.

If a topic is partially addressed, you may recommend reviewing it only if the existing language appears unusually vague, incomplete, or risky.

Avoid presenting recommendations as facts. Phrase them as areas for review.

Return no more than three recommendations.

If the contract appears comprehensive, return an empty array.

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "missing_clauses": [
    {
      "clause_name": "",
      "importance": "Low | Medium | High",
      "why_it_matters": "a short, plain explanation of why this area may deserve review",
      "recommendation": "a short suggestion, phrased as a consideration"
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