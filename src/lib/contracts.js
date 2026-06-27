import { supabase } from './supabaseClient'

// List the current user's contracts, newest first.
export async function listContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, title, risk_level, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Fetch a single contract by id.
export async function getContract(id) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Create a new contract owned by the current user.
export async function createContract({ title, redacted_text }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated.')

  const { data, error } = await supabase
    .from('contracts')
    .insert({ title, redacted_text, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// Update an existing contract.
export async function updateContract(id, fields) {
  const { data, error } = await supabase
    .from('contracts')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Delete a contract.
export async function deleteContract(id) {
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  if (error) throw error
}

// Send redacted text to the serverless analyze function, get structured JSON back.
export async function analyzeContract(redactedText) {
  const res = await fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redacted_text: redactedText }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Analysis failed')
  }
  return res.json()
}

// Save analysis fields onto an existing contract.
export async function saveAnalysis(id, analysis) {
  const fields = {
    summary: analysis.summary ?? '',
    plain_english_summary: analysis.plain_english_summary ?? '',
    risk_level: analysis.risk_level ?? null,
    risk_score: analysis.risk_score ?? null,
    auto_renewal: analysis.auto_renewal ?? false,
    renewal_terms: analysis.renewal_terms ?? '',
    termination_terms: analysis.termination_terms ?? '',
    payment_terms: analysis.payment_terms ?? '',
    important_deadlines: analysis.important_deadlines ?? [],
    obligations: analysis.obligations ?? [],
  }
  return updateContract(id, fields)
}

// Generic POST to an AI feature endpoint with consistent error handling.
async function postAi(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'AI request failed')
  }
  return res.json()
}

// Feature 2: Plain-English summary
export async function generatePlainEnglish(contractText) {
  return postAi('/api/plain-english-summary', { contractText })
}

// Feature 3: Explain a clause (on-demand, not saved)
export async function explainClause(clauseText) {
  return postAi('/api/explain-clause', { clauseText })
}

// Feature 4: AI redaction suggestions (on-demand, not saved)
export async function getRedactionSuggestions(redactedText) {
  return postAi('/api/redaction-suggestions', { redactedText })
}

// Feature 5: Missing clause detection
export async function detectMissingClauses(contractText) {
  return postAi('/api/missing-clauses', { contractText })
}