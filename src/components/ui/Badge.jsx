import clsx from 'clsx'

const variants = {
  default: 'bg-slate-700 text-slate-300',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
