import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { createContract, getContract, updateContract } from '../lib/contracts'

function ContractForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [redactedText, setRedactedText] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

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

  return (
    <Layout title={isEdit ? 'Edit Contract' : 'New Contract'}>
      <div className="max-w-2xl">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
              Contract text
            </label>
            <p className="text-xs text-slate-400 mb-2">
              For now, paste already-safe text. Auto-redaction comes in the next
              build step.
            </p>
            <textarea
              value={redactedText}
              onChange={(e) => setRedactedText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Paste contract text here..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create contract'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-slate-300 bg-white text-sm font-medium px-5 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContractForm