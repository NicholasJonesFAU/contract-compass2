import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You explain a single contract clause in plain English for a non-lawyer.

You will receive a clause (or short excerpt) of contract text, possibly containing redaction labels like [NAME] or [ORG]. Treat those as opaque placeholders.

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "plain_explanation": "what this clause says, in simple terms",
  "why_it_matters": "why this clause is significant to the reader",
  "possible_risks": "risks or downsides this clause could create",
  "recommended_action": "what the reader might want to do or check, phrased as a general consideration"
}

Base everything ONLY on the provided clause. Do not invent terms not present. This is informational only and is NOT legal advice — phrase the recommended action as a general consideration, never as legal counsel.`

export default async (req) => {
  try {
    const clauseText = await readField(req, 'clauseText')
    const client = getClient()
    const result = await runJsonCompletion(client, SYSTEM_PROMPT, clauseText)
    return jsonResponse({
      plain_explanation: result.plain_explanation ?? '',
      why_it_matters: result.why_it_matters ?? '',
      possible_risks: result.possible_risks ?? '',
      recommended_action: result.recommended_action ?? '',
    })
  } catch (err) {
    return errorResponse(err)
  }
}