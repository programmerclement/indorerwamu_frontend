import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Target, BookOpen, Lightbulb,
  Trophy, BarChart3, Settings, ChevronLeft, HeartHandshake, Hospital
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/users',        icon: Users,           label: 'Users'         },
  { to: '/counselors',   icon: HeartHandshake,  label: 'Counselors'    },
  { to: '/healthcenters',icon: Hospital,        label: 'Health Centers'},
  { to: '/challenges',   icon: Target,          label: 'Challenges'    },
  { to: '/articles',     icon: BookOpen,        label: 'Articles'      },
  { to: '/tips',         icon: Lightbulb,       label: 'Wellness Tips' },
  { to: '/rewards',      icon: Trophy,          label: 'Rewards'       },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics'     },
  { to: '/settings',     icon: Settings,        label: 'Settings'      },
]

export default function Sidebar({ mobileOpen, onMobileClose, desktopCollapsed, onDesktopToggle }) {
  const location = useLocation()

  const NavItems = ({ collapsed, onItemClick }) => (
    <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onItemClick}
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
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                {label}
              </div>
            )}
          </NavLink>
        )
      })}
    </nav>
  )

  const Logo = ({ showText }) => (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 min-h-[72px]">
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 p-1.5">
        <img src="/logo.png" alt="Indorerwamu logo" className="w-full h-full object-contain" />
      </div>
      <AnimatePresence>
        {showText && (
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
  )

  return (
    <>
      {/* ── Mobile drawer (< md) ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900 border-r border-slate-700/50 md:hidden"
          >
            <Logo showText />
            <NavItems collapsed={false} onItemClick={onMobileClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (≥ md) ────────────────────── */}
      <motion.aside
        animate={{ width: desktopCollapsed ? 72 : 240 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative hidden md:flex flex-col bg-slate-900 border-r border-slate-700/50 h-screen sticky top-0 overflow-hidden"
      >
        <Logo showText={!desktopCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={onDesktopToggle}
          className="absolute right-[-14px] top-[54px] z-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 shadow-lg hover:bg-slate-700 hover:text-white transition-all"
        >
          <motion.div animate={{ rotate: desktopCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={13} />
          </motion.div>
        </button>

        <NavItems collapsed={desktopCollapsed} onItemClick={undefined} />
      </motion.aside>
    </>
  )
}
