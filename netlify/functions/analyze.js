import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a contract analysis tool that extracts structured information from contract text.

You will receive REDACTED contract text where sensitive details may be replaced with labels like [NAME], [EMAIL], [ORG], [ADDRESS]. Treat those labels as opaque placeholders and analyze around them.

Return ONLY a valid JSON object matching this exact schema, with no markdown, no code fences, and no prose outside the JSON:

{
  "summary": "concise 2-3 sentence summary of the contract",
  "plain_english_summary": "the same explained simply for a non-lawyer",
  "risk_level": "Low | Medium | High",
  "risk_score": integer 1-10,
  "auto_renewal": true or false,
  "renewal_terms": "renewal details, or empty string if none found",
  "termination_terms": "termination details, or empty string if none found",
  "payment_terms": "payment details, or empty string if none found",
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

Rules:
- Base everything ONLY on the provided text. Do not invent dates, parties, or amounts.
- If information is absent, use an empty string "" or an empty array [].
- important_deadlines and obligations must always be arrays (use [] if none).
- risk_score must be an integer from 1 (very low risk) to 10 (very high risk), consistent with risk_level.`

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const redactedText = body?.redacted_text
  if (!redactedText || !redactedText.trim()) {
    return new Response(
      JSON.stringify({ error: 'redacted_text is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  })

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: redactedText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Model did not return valid JSON' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Analysis failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}