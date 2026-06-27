import { useState } from 'react'
import { explainClause } from '../lib/contracts'

function ClauseExplainer() {
  const [clauseText, setClauseText] = useState('')
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExplain = async () => {
    setError(null)
    if (!clauseText.trim()) {
      setError('Paste a clause to explain.')
      return
    }
    setLoading(true)
    setExplanation(null)
    try {
      const result = await explainClause(clauseText)
      setExplanation(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = explanation
    ? [
        ['Plain explanation', explanation.plain_explanation],
        ['Why it matters', explanation.why_it_matters],
        ['Possible risks', explanation.possible_risks],
        ['Recommended action', explanation.recommended_action],
      ]
    : []

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Explain a clause
      </h2>
      <p className="text-xs text-slate-400 mb-3">
        Paste any clause or excerpt from this contract to get a plain-English
        explanation. Results are generated on demand and not saved.
      </p>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <textarea
        value={clauseText}
        onChange={(e) => setClauseText(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
        placeholder="Paste a clause here..."
      />

      <button
        onClick={handleExplain}
        disabled={loading}
        className="mt-3 rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Explaining Clause...' : 'Explain This Clause'}
      </button>

      {explanation && (
        <dl className="mt-4 space-y-3">
          {fields.map(([label, value]) => (
            <div key={label} className="border-l-2 border-slate-200 pl-3">
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="text-sm text-slate-700">
                {value || <span className="text-slate-400">—</span>}
              </dd>
            </div>
          ))}
          <p className="text-[11px] text-slate-400">
            Informational only — not legal advice.
          </p>
        </dl>
      )}
    </div>
  )
}

export default ClauseExplainer