import OpenAI from 'openai'

// Shared helper for AI feature endpoints.
// Centralizes auth-free request validation, the OpenAI call, error handling
// (including 429 rate limits), and JSON parsing so each endpoint stays small.

export function getClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    const err = new Error('Server missing OPENAI_API_KEY')
    err.statusCode = 500
    throw err
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  })
}

// Parse and validate a POST JSON body, returning the named field.
export async function readField(req, fieldName) {
  if (req.method !== 'POST') {
    const err = new Error('Method not allowed')
    err.statusCode = 405
    throw err
  }
  let body
  try {
    body = await req.json()
  } catch {
    const err = new Error('Invalid JSON body')
    err.statusCode = 400
    throw err
  }
  const value = body?.[fieldName]
  if (!value || !String(value).trim()) {
    const err = new Error(`${fieldName} is required`)
    err.statusCode = 400
    throw err
  }
  return value
}

// Run a chat completion that returns JSON, and parse it.
export async function runJsonCompletion(client, systemPrompt, userContent) {
  let completion
  try {
    completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    })
  } catch (apiErr) {
    // Map OpenAI rate limits to a friendly 429
    if (apiErr.status === 429) {
      const err = new Error(
        'AI service is temporarily busy. Please try again in a moment.'
      )
      err.statusCode = 429
      throw err
    }
    const err = new Error(apiErr.message || 'AI request failed')
    err.statusCode = 502
    throw err
  }

  const raw = completion.choices[0]?.message?.content ?? ''
  try {
    return JSON.parse(raw)
  } catch {
    const err = new Error('Model did not return valid JSON')
    err.statusCode = 502
    throw err
  }
}

// Standard JSON response helper.
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Standard error-to-response helper.
export function errorResponse(err) {
  const status = err.statusCode || 500
  return jsonResponse({ error: err.message || 'Server error' }, status)
}