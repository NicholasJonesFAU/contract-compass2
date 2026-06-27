import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Contract Compass</h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="text-base font-medium text-slate-900">{user?.email}</p>
          <p className="mt-4 text-sm text-slate-400">
            Step 8 complete - this is a protected route. Dashboard shell comes next.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard