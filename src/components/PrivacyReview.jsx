import { useState } from 'react'
import { getRedactionSuggestions, updateContract } from '../lib/contracts'

function PrivacyReview({ contract, onUpdated }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [applyingIndex, setApplyingIndex] = useState(null)
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState([])

  const handleScan = async () => {
    setError(null)
    setLoading(true)
    setSuggestions(null)
    setDismissed([])
    try {
      const result = await getRedactionSuggestions(contract.redacted_text)
      setSuggestions(result.suggestions)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRedact = async (suggestion, index) => {
    setError(null)
    setApplyingIndex(index)
    try {
      // Replace every occurrence of the flagged text with its label.
      const newText = contract.redacted_text.split(suggestion.text).join(suggestion.replacement)
      const updated = await updateContract(contract.id, { redacted_text: newText })
      onUpdated(updated)
      // Remove this suggestion from the list once applied.
      setDismissed((prev) => [...prev, index])
    } catch (e) {
      setError(e.message)
    } finally {
      setApplyingIndex(null)
    }
  }

  const handleDismiss = (index) => {
    setDismissed((prev) => [...prev, index])
  }

  const visible = suggestions
    ? suggestions
        .map((s, i) => ({ ...s, index: i }))
        .filter((s) => !dismissed.includes(s.index))
    : []

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-900">
          AI-assisted privacy review
        </h2>
        <button
          onClick={handleScan}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Finding Sensitive Information...' : 'Find Additional Sensitive Information'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        A second AI pass over the redacted text to catch identifying details the
        automatic redaction may have missed. You approve each redaction manually —
        nothing is applied automatically.
      </p>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {suggestions && visible.length === 0 && (
        <p className="text-sm text-slate-400">
          {suggestions.length === 0
            ? 'No additional sensitive information found.'
            : 'All suggestions handled.'}
        </p>
      )}

      {visible.length > 0 && (
        <ul className="space-y-2">
          {visible.map((s) => (
            <li
              key={s.index}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 break-words">
                  {s.text}
                </p>
                <p className="text-xs text-slate-500">
                  {s.reason} → <span className="font-mono">{s.replacement}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleRedact(s, s.index)}
                  disabled={applyingIndex === s.index}
                  className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {applyingIndex === s.index ? 'Redacting...' : 'Redact'}
                </button>
                <button
                  onClick={() => handleDismiss(s.index)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Ignore
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PrivacyReview