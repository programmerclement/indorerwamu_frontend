import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, miniStats }) {
  const colors = {
    blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20' },
    green:  { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    border: 'border-red-500/20' },
    yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400', border: 'border-yellow-500/20' },
    cyan:   { bg: 'bg-cyan-500/10',   icon: 'text-cyan-400',   border: 'border-cyan-500/20' },
    teal:   { bg: 'bg-teal-500/10',   icon: 'text-teal-400',   border: 'border-teal-500/20' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20' },
  }
  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {Icon && (
          <div className={clsx('p-2.5 rounded-xl border', c.bg, c.border)}>
            <Icon size={18} className={c.icon} />
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-100">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {trend !== undefined && (
        <div className={clsx('text-xs font-medium flex items-center gap-1', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs last week</span>
        </div>
      )}

      {miniStats?.length > 0 && (
        <div className="grid gap-2 pt-3 border-t border-slate-700/50"
          style={{ gridTemplateColumns: `repeat(${miniStats.length}, 1fr)` }}>
          {miniStats.map((s, i) => (
            <div key={i} className="text-center">
              <p className={clsx('text-sm font-bold', s.color ?? 'text-slate-200')}>{s.value ?? '—'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
