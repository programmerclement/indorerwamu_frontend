import { useState } from 'react'
import { motion } from 'framer-motion'
import { Server, Key, Globe, Info, CheckCircle } from 'lucide-react'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/FormFields'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Settings are env-based; show info only
    toast.success('Settings noted — update VITE_API_URL in your .env file to change the API URL')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const envRows = [
    { key: 'VITE_API_URL', value: import.meta.env.VITE_API_URL, desc: 'Backend API base URL' },
  ]

  const systemInfo = [
    { label: 'Backend', value: 'Node.js + Express + MongoDB' },
    { label: 'Authentication', value: 'JWT (7-day expiry)' },
    { label: 'Points System', value: '10 pts per challenge completion' },
    { label: 'Badge Thresholds', value: 'Bronze: 100pts · Silver: 500pts · Gold: 1000pts' },
    { label: 'Streak Logic', value: 'All fixed challenges completed for consecutive days' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* API Config */}
      <Card>
        <CardHeader
          title="API Configuration"
          subtitle="Backend connection settings"
          action={<Server size={16} className="text-slate-400" />}
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">API Base URL</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                readOnly
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500">Set via <code className="text-blue-400 bg-slate-700 px-1 py-0.5 rounded">VITE_API_URL</code> in your <code className="text-blue-400 bg-slate-700 px-1 py-0.5 rounded">.env.local</code> file</p>
          </div>
          <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300">
              <strong>Local dev:</strong> <code className="text-blue-400">http://localhost:5000/api</code><br />
              <strong>Production:</strong> <code className="text-blue-400">https://indorerwamu-backend.onrender.com/api</code>
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Setup */}
      <Card>
        <CardHeader title="Admin Account Setup" subtitle="How to create an admin user" action={<Key size={16} className="text-slate-400" />} />
        <div className="space-y-3">
          <p className="text-sm text-slate-400">To grant admin access to a registered user, run the following command in the <strong className="text-slate-300">Backend/</strong> directory:</p>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm">
            <span className="text-green-400">$</span>{' '}
            <span className="text-blue-300">node</span>{' '}
            <span className="text-slate-200">scripts/make-admin.js</span>{' '}
            <span className="text-yellow-300">admin@example.com</span>
          </div>
          <p className="text-xs text-slate-500">This sets <code className="text-blue-400 bg-slate-700 px-1 rounded">isAdmin: true</code> on the user document in MongoDB.</p>
        </div>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader title="System Information" subtitle="Platform configuration overview" action={<Info size={16} className="text-slate-400" />} />
        <div className="space-y-3">
          {systemInfo.map(({ label, value }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start justify-between py-2.5 border-b border-slate-700/40 last:border-0"
            >
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm text-slate-200 font-medium text-right max-w-[60%]">{value}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Env Variables */}
      <Card>
        <CardHeader title="Environment Variables" subtitle="Current runtime configuration" />
        <div className="space-y-2">
          {envRows.map(row => (
            <div key={row.key} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
              <code className="text-xs text-blue-400 font-mono flex-shrink-0">{row.key}</code>
              <span className="text-xs text-slate-500 flex-1 truncate">{row.value || 'not set'}</span>
              <span className="text-xs text-slate-500">{row.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader title="About" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xl">🧠</span>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100">Indorerwamu Admin Dashboard</p>
            <p className="text-sm text-slate-400">Rwanda Innovation Project · Mental Wellness Platform</p>
            <p className="text-xs text-slate-500 mt-1">React + Vite · TanStack Query · TailwindCSS · Recharts</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
