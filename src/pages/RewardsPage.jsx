import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trophy, Star, Award, TrendingUp } from 'lucide-react'
import { rewardsApi } from '@/api/rewards'
import Card, { CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

const BADGE_COLORS = { Bronze: 'yellow', Silver: 'default', Gold: 'yellow' }
const BADGE_ICONS  = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' }

export default function RewardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: rewardsApi.getRewards,
  })

  const topEarners = data?.topEarners || []
  const totalPoints = data?.totalPointsDistributed || 0

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Points Distributed', value: isLoading ? '…' : totalPoints.toLocaleString(), color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { icon: Trophy,     label: 'Users on Leaderboard',     value: isLoading ? '…' : topEarners.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { icon: Star,       label: 'Top Score',                 value: isLoading ? '…' : (topEarners[0]?.points ?? 0).toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl border ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader title="Points Leaderboard" subtitle="Top 20 users by wellness points" />
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : topEarners.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No rewards data yet</p>
            <p className="text-slate-500 text-sm mt-1">Users earn points by completing daily challenges</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topEarners.map((r, idx) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors"
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-yellow-500 text-slate-900' :
                  idx === 1 ? 'bg-slate-400 text-slate-900' :
                  idx === 2 ? 'bg-amber-600 text-white' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {idx + 1}
                </div>

                {/* Avatar + name */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.user?.name?.[0]?.toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{r.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 truncate">{r.user?.email}</p>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-1">
                  {r.badges?.map(b => (
                    <span key={b} title={b} className="text-lg">{BADGE_ICONS[b] || '🏅'}</span>
                  ))}
                </div>

                {/* Streak */}
                {r.streak > 0 && (
                  <div className="hidden md:flex items-center gap-1 text-xs text-orange-400 font-medium">
                    🔥 {r.streak}d
                  </div>
                )}

                {/* Points */}
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                  <Star size={12} className="text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400">{r.points.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Points system info */}
      <Card>
        <CardHeader title="Points System" subtitle="How users earn points" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Complete a challenge',   points: '+10 pts', icon: '✅' },
            { label: 'Earn Bronze badge',       points: '100 pts', icon: BADGE_ICONS.Bronze },
            { label: 'Earn Silver badge',       points: '500 pts', icon: BADGE_ICONS.Silver },
          ].map(item => (
            <div key={item.label} className="bg-slate-700/30 rounded-xl p-4 text-center">
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm font-semibold text-slate-200 mt-2">{item.points}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
