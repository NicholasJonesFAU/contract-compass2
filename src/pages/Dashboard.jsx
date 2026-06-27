import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { listContracts, deleteContract } from '../lib/contracts'


function Dashboard() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      setContracts(await listContracts())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteContract(id)
      setContracts((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }


  const newButton = (
    <button
      onClick={() => navigate('/contracts/new')}
      className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition-colors"
    >
      New Contract
    </button>
  )

  return (
    <Layout title="My Contracts" action={newButton}>
      <div className="max-w-4xl">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-base font-medium text-slate-900 mb-1">
              No contracts yet
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Create your first contract to get started.
            </p>
            <button
              onClick={() => navigate('/contracts/new')}
              className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition-colors"
            >
              New Contract
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/contracts/${c.id}/edit`)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.title)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard