import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  createContract,
  getContract,
  updateContract,
  analyzeContract,
} from '../lib/contracts'
import { redactText } from '../lib/redaction'

const statLabels = {
  EMAIL: ['email', 'emails'],
  PHONE: ['phone number', 'phone numbers'],
  SSN: ['SSN', 'SSNs'],
  ADDRESS: ['address', 'addresses'],
  ORG: ['organization', 'organizations'],
  NAME: ['name', 'names'],
}

function formatStats(stats) {
  const entries = Object.entries(stats).filter(([, n]) => n > 0)
  if (entries.length === 0) return null
  return entries
    .map(([k, n]) => {
      const [sing, plur] = statLabels[k] || [k.toLowerCase(), `${k.toLowerCase()}s`]
      return `${n} ${n === 1 ? sing : plur}`
    })
    .join(', ')
}

function ContractForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  // 'paste' = entering raw text (new contracts only); 'review' = reviewing redacted text
  const [stage, setStage] = useState(isEdit ? 'review' : 'paste')
  const [title, setTitle] = useState('')
  const [rawText, setRawText] = useState('') // in-memory only — never saved
  const [redactedText, setRedactedText] = useState('')
  const [stats, setStats] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  // Step 13 test state (temporary — Step 14 replaces this)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    getContract(id)
      .then((c) => {
        setTitle(c.title ?? '')
        setRedactedText(c.redacted_text ?? '')
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const handleRedact = () => {
    setError(null)
    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }
    if (!rawText.trim()) {
      setError('Please paste the contract text to redact.')
      return
    }
    const { redactedText: redacted, stats: s } = redactText(rawText)
    setRedactedText(redacted)
    setStats(s)
    setRawText('') // discard raw text from memory once redacted
    setStage('review')
  }

  const handleStartOver = () => {
    setRedactedText('')
    setStats({})
    setAnalysisResult(null)
    setStage('paste')
  }

  const handleAnalyze = async () => {
    setError(null)
    setAnalyzing(true)
    try {
      const result = await analyzeContract(redactedText)
      setAnalysisResult(result)
      console.log('Analysis result:', result)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await updateContract(id, { title, redacted_text: redactedText })
      } else {
        await createContract({ title, redacted_text: redactedText })
      }
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Layout title="Loading...">
        <p className="text-sm text-slate-400">Loading contract...</p>
      </Layout>
    )
  }

  const statsSummary = formatStats(stats)

  return (
    <Layout title={isEdit ? 'Edit Contract' : 'New Contract'}>
      <div className="max-w-2xl">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STAGE 1: paste raw text (new contracts only) */}
        {stage === 'paste' && (
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g. Office Lease Agreement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Paste contract text
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Paste the full original text. It is redacted in your browser and
                the original is never saved.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Paste the original contract text here..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRedact}
                className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 transition-colors"
              >
                Redact &amp; review
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-slate-300 bg-white text-sm font-medium px-5 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: review redacted text */}
        {stage === 'review' && (
          <div className="space-y-4">
            {!isEdit && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                <p className="font-medium">Original text discarded.</p>
                <p className="mt-0.5 text-emerald-700">
                  {statsSummary
                    ? `Auto-redacted ${statsSummary}. `
                    : 'No sensitive patterns were auto-detected. '}
                  Review the text below and edit anything the auto-redactor
                  missed before saving. Only this redacted version is stored.
                </p>
              </div>
            )}

            <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4">
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Redacted text
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Edit freely. Replace anything sensitive that slipped through
                  with a label like [NAME] or [REDACTED].
                </p>
                <textarea
                  value={redactedText}
                  onChange={(e) => setRedactedText(e.target.value)}
                  rows={14}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Save contract'}
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="rounded-lg border border-slate-300 bg-white text-sm font-medium px-5 py-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  {analyzing ? 'Analyzing...' : 'Test analyze'}
                </button>

                {!isEdit && (
                  <button
                    onClick={handleStartOver}
                    className="rounded-lg border border-slate-300 bg-white text-sm font-medium px-5 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Start over
                  </button>
                )}
                {isEdit && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-lg border border-slate-300 bg-white text-sm font-medium px-5 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {analysisResult && (
                <pre className="mt-4 rounded-lg bg-slate-900 text-slate-100 text-xs p-4 overflow-auto max-h-96">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ContractForm