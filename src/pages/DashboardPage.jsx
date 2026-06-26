import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, Activity, Target, BookOpen, Lightbulb, Trophy,
  UserPlus, TrendingUp, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import StatCard from '@/components/ui/StatCard'
import Card, { CardHeader } from '@/components/ui/Card'
import { StatCardSkeleton } from '@/components/ui/Skeleton'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MOOD_LABELS = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' }
const MOOD_COLORS = ['#D0021B', '#F5A623', '#4A90E2', '#7ED321', '#9013FE']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  })

  const overview = data?.overview
  const charts = data?.charts

  // Format monthly growth
  const growthData = charts?.monthlyGrowth?.map(m => ({
    name: MONTHS[(m._id.month - 1)],
    users: m.count,
  })) || []

  // Format daily registrations (last 14 days)
  const regData = charts?.dailyRegistrations?.map(d => ({
    name: d._id.slice(5),
    registrations: d.count,
  })) || []

  // Format daily completions
  const compData = charts?.dailyCompletions?.map(d => ({
    name: d._id.slice(5),
    completions: d.count,
  })) || []

  // Merge reg + completions by date
  const mergedDaily = regData.map(r => ({
    ...r,
    completions: compData.find(c => c.name === r.name)?.completions || 0,
  }))

  // Mood distribution pie
  const moodPie = charts?.moodDistribution?.map(m => ({
    name: MOOD_LABELS[m._id] || `Level ${m._id}`,
    value: m.count,
    color: MOOD_COLORS[m._id - 1],
  })) || []

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Failed to load stats</p>
        <p className="text-slate-500 text-sm mt-1">{error.response?.data?.message || error.message}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard title="Total Users"        value={overview?.totalUsers}        icon={Users}    color="blue"   subtitle="All registered accounts" />
            <StatCard title="Active Users"       value={overview?.activeUsers}       icon={Activity} color="green"  subtitle="Logged mood last 7 days" />
            <StatCard title="New This Month"     value={overview?.newUsersThisMonth} icon={UserPlus} color="purple" subtitle={`${overview?.newUsersThisWeek} this week`} />
            <StatCard title="Total Mood Entries" value={overview?.totalMoods}        icon={TrendingUp} color="cyan" subtitle="All check-ins recorded" />
            <StatCard title="Challenges"         value={overview?.totalChallenges}   icon={Target}   color="yellow" subtitle={`${overview?.totalCompletions} total completions`} />
            <StatCard title="Articles"           value={overview?.totalArticles}     icon={BookOpen} color="blue"   subtitle="Education resources" />
            <StatCard title="Wellness Tips"      value={overview?.totalTips}         icon={Lightbulb} color="green" subtitle="Mood-based tips" />
            <StatCard title="Suspended Users"    value={overview?.suspendedUsers}    icon={AlertTriangle} color="red" subtitle={`${overview?.adminUsers} admins`} />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Growth */}
        <Card className="lg:col-span-2">
          <CardHeader title="User Growth" subtitle="Monthly new registrations" />
          {isLoading ? (
            <div className="h-56 bg-slate-700 rounded-xl animate-pulse" />
          ) : growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#4A90E2" strokeWidth={2} fill="url(#colorUsers)" dot={{ fill: '#4A90E2', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No growth data yet" />
          )}
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader title="Mood Distribution" subtitle="All-time check-ins" />
          {isLoading ? (
            <div className="h-56 bg-slate-700 rounded-xl animate-pulse" />
          ) : moodPie.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={moodPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {moodPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5">
                {moodPie.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-slate-400">{m.name}</span>
                    </div>
                    <span className="text-slate-300 font-medium">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="No mood data yet" />
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader title="Daily Activity" subtitle="Registrations vs completions (last 14 days)" />
        {isLoading ? (
          <div className="h-56 bg-slate-700 rounded-xl animate-pulse" />
        ) : mergedDaily.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mergedDaily} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="registrations" name="Registrations" fill="#4A90E2" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="completions"   name="Completions"   fill="#7ED321" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="No activity data yet" />
        )}
      </Card>
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="h-56 flex items-center justify-center">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}
