import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' } : {}}
      transition={{ duration: 0.2 }}
      className={clsx(
        'bg-slate-800 border border-slate-700/50 rounded-2xl p-6',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
