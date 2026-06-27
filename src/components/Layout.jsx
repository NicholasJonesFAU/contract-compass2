import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Layout({ title, action, children }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItemClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-800 text-white'
        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
    }`

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-lg font-bold tracking-tight">
            Contract Compass
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/dashboard" className={navItemClass} end>
            My Contracts
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Signed in as</p>
          <p className="text-sm font-medium text-slate-100 truncate mb-3">
            {user?.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {action}
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout