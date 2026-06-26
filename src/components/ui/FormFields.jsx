import clsx from 'clsx'

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input
        className={clsx(
          'w-full bg-slate-700/50 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all',
          error ? 'border-red-500/60' : 'border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        className={clsx(
          'w-full bg-slate-700/50 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all',
          error ? 'border-red-500/60' : 'border-slate-600',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={clsx(
          'w-full bg-slate-700/50 border rounded-xl px-4 py-2.5 text-sm text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all',
          error ? 'border-red-500/60' : 'border-slate-600',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-blue-500' : 'bg-slate-600'
        )}
      >
        <div className={clsx(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
          checked ? 'left-6' : 'left-1'
        )} />
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  )
}
