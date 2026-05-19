import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-ink-900/80 backdrop-blur-md border-b border-ink-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4" />
            </svg>
          </div>
          <span className="font-display font-bold text-slate-200 text-lg tracking-tight hidden sm:block">
            WareIMS
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-500 font-body text-sm">{user.username}</span>
                <span className={user.role === 'manager' ? 'badge-manager' : 'badge-worker'}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-secondary !px-4 !py-2 text-xs">
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
