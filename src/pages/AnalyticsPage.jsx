import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { analyticsApi } from '@/api/analytics'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const MOOD_COLORS = ['', '#D0021B', '#F5A623', '#94A3B8', '#7ED321', '#4A90E2']
const MOOD_LABELS = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy']

const DAY_OPTIONS = [
  { value: 7,  label: '7d' },
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-moods', days],
    queryFn: () => analyticsApi.getMoods(days),
  })

  const dailyMoods = data?.dailyMoods || []
  const moodLabels = data?.moodLabelCounts || []
  const recentEntries = data?.recentEntries || []

  const chartData = dailyMoods.map(d => ({
    date: d._id.slice(5),
    avg: Number(d.avgLevel.toFixed(2)),
    count: d.count,
  }))

  const labelData = moodLabels.map(m => ({
    label: m._id || 'Unknown',
    count: m.count,
  }))

  const formatDate = (d) => new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="space-y-6">
      {/* Header + day selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Mood trends across all users</p>
        </div>
        <div className="flex gap-1 bg-slate-800 border border-slate-700/50 rounded-xl p-1">
          {DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                days === opt.value ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Avg Mood Level Chart */}
      <Card>
        <CardHeader title="Average Mood Level" subtitle={`Daily average across all users (last ${days} days)`} />
        {isLoading ? (
          <div className="h-64 bg-slate-700 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => MOOD_LABELS[v] || v} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg" name="Avg Level" stroke="#4A90E2" strokeWidth={2.5} dot={{ fill: '#4A90E2', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Check-ins per day */}
      <Card>
        <CardHeader title="Daily Check-ins Volume" subtitle="Number of mood entries per day" />
        {isLoading ? (
          <div className="h-52 bg-slate-700 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Check-ins" fill="#9013FE" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood labels */}
        <Card>
          <CardHeader title="Mood Labels Used" subtitle="Most common self-reported labels" />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : labelData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-3">
              {labelData.slice(0, 8).map((l, i) => {
                const max = labelData[0]?.count || 1
                return (
                  <div key={l.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium capitalize">{l.label}</span>
                      <span className="text-slate-400">{l.count}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(l.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent entries */}
        <Card>
          <CardHeader title="Recent Mood Entries" subtitle="Latest check-ins across all users" />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : recentEntries.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentEntries.map(e => (
                <div key={e._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MOOD_COLORS[e.level] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{e.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{formatDate(e.createdAt)}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: MOOD_COLORS[e.level], background: `${MOOD_COLORS[e.level]}15` }}>
                    {MOOD_LABELS[e.level]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-52 flex items-center justify-center">
      <p className="text-slate-500 text-sm">No data for this period</p>
    </div>
  )
}
