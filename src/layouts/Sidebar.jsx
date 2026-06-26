import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Target, BookOpen, Lightbulb,
  Trophy, BarChart3, Settings, LogOut, ChevronLeft, Brain
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',      icon: Users,           label: 'Users' },
  { to: '/challenges', icon: Target,          label: 'Challenges' },
  { to: '/articles',   icon: BookOpen,        label: 'Articles' },
  { to: '/tips',       icon: Lightbulb,       label: 'Wellness Tips' },
  { to: '/rewards',    icon: Trophy,          label: 'Rewards' },
  { to: '/analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative flex flex-col bg-slate-900 border-r border-slate-700/50 h-screen sticky top-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Brain size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-slate-100 whitespace-nowrap">Indorerwamu</p>
              <p className="text-xs text-slate-400 whitespace-nowrap">Admin Dashboard</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[52px] z-10 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-600 transition-colors shadow-lg"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft size={12} />
        </motion.div>
      </button>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                active
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              <Icon size={18} className="flex-shrink-0 relative z-10" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap relative z-10"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <div className={clsx('flex items-center gap-3 px-2 py-2 rounded-xl mb-1', !collapsed && 'mb-2')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                <p className="text-xs font-medium text-slate-200 whitespace-nowrap truncate max-w-[130px]">{user?.name}</p>
                <p className="text-xs text-slate-500 whitespace-nowrap">Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut size={17} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
