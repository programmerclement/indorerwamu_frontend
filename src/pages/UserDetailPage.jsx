import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Mail, Calendar, Globe, Shield, Ban,
  TrendingUp, Target, Award
} from 'lucide-react'
import { usersApi } from '@/api/users'
import Card, { CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

const MOOD_LABELS = ['', 'Very Sad 😢', 'Sad 😟', 'Neutral 😐', 'Happy 😊', 'Very Happy 😁']
const MOOD_COLORS = ['', 'text-red-400', 'text-orange-400', 'text-slate-400', 'text-green-400', 'text-blue-400']

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => usersApi.getUser(id),
  })

  const user = data?.user
  const moods = data?.moodHistory || []
  const completions = data?.completions || []
  const reward = data?.rewardSummary

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/users')} size="sm">
        Back to Users
      </Button>

      {/* Profile Card */}
      <Card>
        {isLoading ? (
          <div className="flex items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
                {user?.isAdmin && <Badge variant="blue">Admin</Badge>}
                {user?.isSuspended && <Badge variant="red">Suspended</Badge>}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Mail size={13} />{user?.email}</span>
                <span className="flex items-center gap-1.5"><Globe size={13} />{user?.language === 'rw' ? 'Kinyarwanda' : 'English'}</span>
                <span className="flex items-center gap-1.5"><Calendar size={13} />Joined {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Mood Entries', value: isLoading ? '—' : moods.length, color: 'text-blue-400' },
          { icon: Target,     label: 'Completions',  value: isLoading ? '—' : completions.length, color: 'text-green-400' },
          { icon: Award,      label: 'Points',        value: isLoading ? '—' : (reward?.points ?? 0), color: 'text-yellow-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="text-center p-4">
            <Icon size={20} className={`mx-auto mb-2 ${color}`} />
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood History */}
        <Card>
          <CardHeader title="Mood History" subtitle={`Last ${moods.length} check-ins`} />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : moods.length === 0 ? (
            <EmptyState message="No mood entries yet" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {moods.map(m => (
                <div key={m._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30">
                  <span className={`text-sm font-bold mt-0.5 ${MOOD_COLORS[m.level]}`}>{m.level}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${MOOD_COLORS[m.level]}`}>{MOOD_LABELS[m.level]}</p>
                    {m.note && <p className="text-xs text-slate-500 mt-0.5 truncate">{m.note}</p>}
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Challenge Completions */}
        <Card>
          <CardHeader title="Challenge Completions" subtitle={`Last ${completions.length} completions`} />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : completions.length === 0 ? (
            <EmptyState message="No completions yet" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {completions.map(c => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{c.challengeKey.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Badges */}
      {reward?.badges?.length > 0 && (
        <Card>
          <CardHeader title="Earned Badges" />
          <div className="flex flex-wrap gap-2">
            {reward.badges.map(b => (
              <Badge key={b} variant="yellow" className="text-sm px-4 py-1.5">🏅 {b}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return <p className="text-slate-500 text-sm text-center py-8">{message}</p>
}
