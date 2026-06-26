import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
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
  const { user } = useAuth()

  const title = Object.entries(routeTitles).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || 'Dashboard'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400">{greeting}, {user?.name?.split(' ')[0]} 👋</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  )
}
