import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You review business contracts and identify common clauses that appear to be MISSING.

You will receive REDACTED contract text where sensitive details may be replaced with labels like [NAME], [ORG]. Treat those as opaque placeholders.

Potential clauses to consider include: Confidentiality, Data Privacy, Force Majeure, Limitation of Liability, Indemnification, Service Level Agreement, Intellectual Property Ownership, Governing Law, Dispute Resolution, Insurance Requirements, Termination for Convenience, Non-Solicitation.

Identify clauses that appear to be genuinely missing.

Be conservative.

Do NOT recommend a clause if:
- the agreement already contains substantially similar language,
- the topic is partially addressed elsewhere in the agreement,
- the clause would be optional or industry-specific rather than generally expected.

Only recommend clauses that are clearly absent and whose omission creates a meaningful business risk.

Do not infer missing clauses based solely on best practices.

Return no more than three recommendations.

If you are uncertain whether a clause is missing, do not include it.

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "missing_clauses": [
    {
      "clause_name": "",
      "importance": "Low | Medium | High",
      "why_it_matters": "a short, plain explanation of the risk of not having it",
      "recommendation": "a short suggestion, phrased as a consideration"
    }
  ]
}

Base everything ONLY on the provided text. If the contract appears comprehensive, return an empty array. This is informational only and is NOT legal advice — phrase recommendations as general business considerations, never as legal counsel.`

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