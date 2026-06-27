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