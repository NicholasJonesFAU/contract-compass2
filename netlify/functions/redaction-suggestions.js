import {
  getClient,
  readField,
  runJsonCompletion,
  jsonResponse,
  errorResponse,
} from './_aiHelper.js'

const SYSTEM_PROMPT = `You are a privacy reviewer. You receive contract text that has ALREADY been redacted with labels like [EMAIL], [PHONE], [NAME], [ORG]. Your job is to find ADDITIONAL potentially identifying information that automated regex redaction may have missed.

Look for things such as: company names, personal names, university or institution names, project or product names, account numbers, business identifiers, or other potentially identifying details that still appear in plain text.

Do NOT flag text that is already a redaction label (anything in [BRACKETS]). Do NOT flag generic contract language, dates, or dollar amounts.

For each item you find, suggest a label-style replacement (e.g. [COMPANY_NAME], [PERSON_NAME], [UNIVERSITY], [PROJECT_NAME], [ACCOUNT_NUMBER]).

Return ONLY a valid JSON object with this exact shape, no markdown or prose outside the JSON:

{
  "suggestions": [
    {
      "text": "the exact text from the document that should be reviewed",
      "replacement": "[SUGGESTED_LABEL]",
      "reason": "a short reason, e.g. 'Company name'"
    }
  ]
}

If nothing additional is found, return an empty array. Base everything ONLY on the provided text.`

export default async (req) => {
  try {
    const redactedText = await readField(req, 'redactedText')
    const client = getClient()
    const result = await runJsonCompletion(client, SYSTEM_PROMPT, redactedText)
    return jsonResponse({
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    })
  } catch (err) {
    return errorResponse(err)
  }
}