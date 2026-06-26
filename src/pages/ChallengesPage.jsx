import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, CheckCircle, Circle, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { challengesApi } from '@/api/challenges'
import Button from '@/components/ui/Button'
import Card, { CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Input, Textarea, Toggle } from '@/components/ui/FormFields'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

function ChallengeForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues || { key: '', title: '', description: '', fixed: false }
  })
  const fixed = watch('fixed')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Key (unique identifier)"
        placeholder="e.g. drink_water"
        error={errors.key?.message}
        {...register('key', { required: 'Key is required', pattern: { value: /^[a-z0-9_]+$/, message: 'Lowercase letters, numbers and underscores only' } })}
        disabled={!!defaultValues}
      />
      <Input
        label="Title"
        placeholder="e.g. Drink Water"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />
      <Textarea
        label="Description"
        placeholder="Short description of the challenge"
        {...register('description')}
      />
      <Toggle
        label="Fixed challenge (shown daily to all users)"
        checked={fixed}
        onChange={(v) => setValue('fixed', v)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Challenge'}
        </Button>
      </div>
    </form>
  )
}

export default function ChallengesPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: challengesApi.getChallenges,
  })

  const createMutation = useMutation({
    mutationFn: challengesApi.createChallenge,
    onSuccess: () => { toast.success('Challenge created!'); setCreateOpen(false); qc.invalidateQueries({ queryKey: ['admin-challenges'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => challengesApi.updateChallenge(id, data),
    onSuccess: () => { toast.success('Challenge updated!'); setEditTarget(null); qc.invalidateQueries({ queryKey: ['admin-challenges'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: challengesApi.deleteChallenge,
    onSuccess: () => { toast.success('Challenge deleted'); setDeleteTarget(null); qc.invalidateQueries({ queryKey: ['admin-challenges'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  })

  const challenges = data?.challenges || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Challenges</h2>
          <p className="text-sm text-slate-400 mt-0.5">{challenges.length} challenges in total</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>New Challenge</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={5} /> : challenges.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No challenges found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Challenge</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Key</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Completions</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {challenges.map((ch, idx) => (
                  <motion.tr
                    key={ch._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Target size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{ch.title}</p>
                          {ch.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{ch.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <code className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">{ch.key}</code>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-300 font-medium">{ch.completionCount ?? 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      {ch.fixed
                        ? <Badge variant="green"><CheckCircle size={10} className="mr-1" />Daily Fixed</Badge>
                        : <Badge variant="default"><Circle size={10} className="mr-1" />Optional</Badge>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(ch)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ch)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Challenge">
        <ChallengeForm
          onSubmit={(d) => createMutation.mutate(d)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Challenge">
        {editTarget && (
          <ChallengeForm
            defaultValues={editTarget}
            onSubmit={(d) => updateMutation.mutate({ id: editTarget._id, data: d })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Challenge"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}

function Target({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
