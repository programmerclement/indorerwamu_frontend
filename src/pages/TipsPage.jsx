import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Lightbulb, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { tipsApi } from '@/api/tips'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/FormFields'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const MOODS = ['happy', 'neutral', 'sad', 'stressed', 'very_sad']

const MOOD_BADGE = {
  happy: 'green', neutral: 'blue', sad: 'yellow', stressed: 'red', very_sad: 'red'
}

function TipForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { title: '', subtitle: '', duration: 5, mood: 'neutral', iconName: '' }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="e.g. 4-7-8 Breathing"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />
      <Textarea
        label="Subtitle / description"
        placeholder="Short description shown on the card"
        {...register('subtitle')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Target Mood" error={errors.mood?.message} {...register('mood', { required: true })}>
          {MOODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </Select>
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          {...register('duration', { valueAsNumber: true })}
        />
      </div>
      <Input
        label="Icon name (optional)"
        placeholder="e.g. wind, droplets, heart"
        {...register('iconName')}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Tip'}
        </Button>
      </div>
    </form>
  )
}

export default function TipsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tips'],
    queryFn: tipsApi.getTips,
  })

  const createMutation = useMutation({
    mutationFn: tipsApi.createTip,
    onSuccess: () => { toast.success('Tip created!'); setCreateOpen(false); qc.invalidateQueries({ queryKey: ['admin-tips'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tipsApi.updateTip(id, data),
    onSuccess: () => { toast.success('Tip updated!'); setEditTarget(null); qc.invalidateQueries({ queryKey: ['admin-tips'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: tipsApi.deleteTip,
    onSuccess: () => { toast.success('Tip deleted'); setDeleteTarget(null); qc.invalidateQueries({ queryKey: ['admin-tips'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const tips = data?.tips || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Wellness Tips</h2>
          <p className="text-sm text-slate-400 mt-0.5">{tips.length} tips available</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>New Tip</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={5} /> : tips.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tips yet. Create the first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Tip</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Mood</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Duration</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {tips.map((t, idx) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <Lightbulb size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{t.title}</p>
                          {t.subtitle && <p className="text-xs text-slate-500 truncate max-w-[200px]">{t.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <Badge variant={MOOD_BADGE[t.mood] || 'default'}>
                        {t.mood.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {t.duration && (
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock size={12} />{t.duration} min
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(t)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Wellness Tip">
        <TipForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Wellness Tip">
        {editTarget && <TipForm defaultValues={editTarget} onSubmit={(d) => updateMutation.mutate({ id: editTarget._id, data: d })} loading={updateMutation.isPending} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Tip"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
