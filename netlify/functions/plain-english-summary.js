import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You explain contracts in plain English for a non-lawyer.

You will receive REDACTED contract text where sensitive details may be replaced with labels like [NAME], [EMAIL], [ORG]. Treat those as opaque placeholders.

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "plain_english_summary": "a clear, friendly explanation covering: what the contract does, how long it lasts, how to cancel it, the key responsibilities of each party, the major risks, and what the reader should pay closest attention to. Use short paragraphs or simple sentences. Avoid legal jargon."
}

Base everything ONLY on the provided text. Do not invent details. This is informational only, not legal advice.`

export default async (req) => {
  try {
    const contractText = await readField(req, 'contractText')
    const client = getClient()
    const result = await runJsonCompletion(client, SYSTEM_PROMPT, contractText)
    return jsonResponse({
      plain_english_summary: result.plain_english_summary ?? '',
    })
  } catch (err) {
    return errorResponse(err)
  }
}