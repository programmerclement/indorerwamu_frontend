import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Settings, UserCircle2, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const routeTitles = {
  '/dashboard':  'Dashboard',
  '/users':      'Users',
  '/challenges': 'Challenges',
  '/articles':   'Articles',
  '/tips':       'Wellness Tips',
  '/rewards':    'Rewards',
  '/analytics':  'Analytics',
  '/settings':   'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const title = Object.entries(routeTitles).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || 'Dashboard'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavigate = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400">{greeting}, {user?.name?.split(' ')[0] || 'Admin'}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/80 px-2 py-1.5 text-left transition-colors hover:bg-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden text-sm font-medium text-slate-200 max-w-[120px] truncate sm:block">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown size={16} className={`hidden text-slate-400 transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700/70 bg-slate-800/95 p-2 shadow-2xl shadow-black/20 backdrop-blur">
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700/70 hover:text-white"
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700/70 hover:text-white"
              >
                <UserCircle2 size={16} />
                Profile
              </button>
              <div className="my-1 h-px bg-slate-700/70" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
