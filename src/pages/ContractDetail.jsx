import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  getContract,
  analyzeContract,
  saveAnalysis,
  generatePlainEnglish,
  detectMissingClauses,
  updateContract,
} from '../lib/contracts'
import ClauseExplainer from '../components/ClauseExplainer'

const riskColors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-red-50 text-red-700 border-red-200',
}

const importanceColors = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
}

function Section({ title, children, action }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contract, setContract] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [detectingClauses, setDetectingClauses] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setContract(await getContract(id))
    } catch (e) {
      setError(e.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleAnalyze = async () => {
    setError(null)
    setAnalyzing(true)

    try {
      const result = await analyzeContract(contract.redacted_text)
      const updated = await saveAnalysis(id, result)
      setContract(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handlePlainEnglish = async () => {
    setError(null)
    setSummarizing(true)

    try {
      const result = await generatePlainEnglish(contract.redacted_text)
      const updated = await updateContract(id, {
        plain_english_summary: result.plain_english_summary,
      })
      setContract(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setSummarizing(false)
    }
  }

  const handleMissingClauses = async () => {
    setError(null)
    setDetectingClauses(true)

    try {
      const result = await detectMissingClauses(contract.redacted_text)
      const updated = await updateContract(id, {
        missing_clauses: result.missing_clauses,
      })
      setContract(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setDetectingClauses(false)
    }
  }

  if (fetching) {
    return (
      <Layout title="Loading...">
        <p className="text-sm text-slate-400">Loading contract...</p>
      </Layout>
    )
  }

  if (!contract) {
    return (
      <Layout title="Not found">
        <p className="text-sm text-slate-500">Contract not found.</p>
      </Layout>
    )
  }

  const hasAnalysis = Boolean(contract.summary || contract.risk_level)

  const headerAction = (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/contracts/${id}/edit`)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Edit
      </button>

      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {analyzing ? 'Analyzing...' : hasAnalysis ? 'Re-analyze' : 'Analyze'}
      </button>
    </div>
  )

  return (
    <Layout title={contract.title} action={headerAction}>
      <div className="max-w-3xl space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!hasAnalysis ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-base font-medium text-slate-900 mb-1">
              Not analyzed yet
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Run AI analysis on the redacted text to extract a structured
              breakdown.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'Analyze contract'}
            </button>
          </div>
        ) : (
          <>
            <Section title="Overview">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                    riskColors[contract.risk_level] ||
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {contract.risk_level} risk
                </span>

                {contract.risk_score != null && (
                  <span className="text-xs text-slate-500">
                    Risk score: {contract.risk_score}/10
                  </span>
                )}

                {contract.auto_renewal && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-medium">
                    Auto-renews
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700">{contract.summary}</p>
            </Section>

            <Section
              title="Plain-English summary"
              action={
                <button
                  onClick={handlePlainEnglish}
                  disabled={summarizing}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  {summarizing
                    ? 'Generating Summary...'
                    : contract.plain_english_summary
                      ? 'Regenerate'
                      : 'Generate Plain-English Summary'}
                </button>
              }
            >
              {contract.plain_english_summary ? (
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {contract.plain_english_summary}
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Generate a friendly, jargon-free explanation of this contract.
                </p>
              )}
            </Section>

            <Section title="Key terms">
              <dl className="space-y-3">
                {[
                  ['Renewal', contract.renewal_terms],
                  ['Termination', contract.termination_terms],
                  ['Payment', contract.payment_terms],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-slate-500">
                      {label}
                    </dt>
                    <dd className="text-sm text-slate-700">
                      {value || (
                        <span className="text-slate-400">Not specified</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Important deadlines">
              {contract.important_deadlines?.length ? (
                <ul className="space-y-3">
                  {contract.important_deadlines.map((d, i) => (
                    <li key={i} className="border-l-2 border-slate-200 pl-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-900">
                          {d.deadline_type}
                        </span>

                        {d.importance && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              importanceColors[d.importance] ||
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {d.importance}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600">{d.description}</p>

                      {d.date_or_trigger && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {d.date_or_trigger}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No deadlines identified.
                </p>
              )}
            </Section>

            <Section title="Obligations">
              {contract.obligations?.length ? (
                <ul className="space-y-3">
                  {contract.obligations.map((o, i) => (
                    <li key={i} className="border-l-2 border-slate-200 pl-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-slate-500">
                          {o.party}
                        </span>

                        {o.deadline_or_frequency && (
                          <span className="text-xs text-slate-400">
                            · {o.deadline_or_frequency}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-700">{o.obligation}</p>

                      {o.risk_if_missed && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Risk if missed: {o.risk_if_missed}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No obligations identified.
                </p>
              )}
            </Section>

            <Section
              title="Potentially missing clauses"
              action={
                <button
                  onClick={handleMissingClauses}
                  disabled={detectingClauses}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  {detectingClauses
                    ? 'Analyzing Missing Clauses...'
                    : contract.missing_clauses?.length
                      ? 'Re-analyze'
                      : 'Analyze Missing Clauses'}
                </button>
              }
            >
              {contract.missing_clauses?.length ? (
                <>
                  <ul className="space-y-3">
                    {contract.missing_clauses.map((c, i) => (
                      <li key={i} className="border-l-2 border-amber-200 pl-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-900">
                            ⚠ {c.clause_name}
                          </span>

                          {c.importance && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                importanceColors[c.importance] ||
                                'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c.importance}
                            </span>
                          )}
                        </div>

                        {c.why_it_matters && (
                          <p className="text-sm text-slate-600">
                            {c.why_it_matters}
                          </p>
                        )}

                        {c.recommendation && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {c.recommendation}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 text-[11px] text-slate-400">
                    Informational only — not legal advice.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  Check for common business clauses that may be absent from this
                  contract.
                </p>
              )}
            </Section>

            <ClauseExplainer />
          </>
        )}
      </div>
    </Layout>
  )
}

export default ContractDetail