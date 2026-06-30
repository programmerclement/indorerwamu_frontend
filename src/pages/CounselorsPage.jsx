import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, UserRound, Phone, Mail, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { counselorsApi } from '@/api/counselors'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/FormFields'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

function CounselorForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { name: '', email: '', telephone: '', address: '' }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="e.g. Dr. Marie Uwimana"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Telephone"
          placeholder="+250 7XX XXX XXX"
          error={errors.telephone?.message}
          {...register('telephone', { required: 'Telephone is required' })}
        />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="counselor@example.com"
          {...register('email')}
        />
      </div>
      <Textarea
        label="Office Address (optional)"
        placeholder="e.g. KG 123 St, Kigali, Rwanda"
        rows={2}
        {...register('address')}
      />
      {defaultValues && (
        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="isActive"
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 cursor-pointer"
            defaultChecked={defaultValues.isActive !== false}
            {...register('isActive')}
          />
          <label htmlFor="isActive" className="text-sm text-slate-300 cursor-pointer select-none">
            Active (visible in the app)
          </label>
        </div>
      )}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Add Counselor'}
        </Button>
      </div>
    </form>
  )
}

export default function CounselorsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-counselors'],
    queryFn: counselorsApi.getCounselors,
  })

  const createMutation = useMutation({
    mutationFn: counselorsApi.createCounselor,
    onSuccess: () => { toast.success('Counselor added!'); setCreateOpen(false); qc.invalidateQueries({ queryKey: ['admin-counselors'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => counselorsApi.updateCounselor(id, data),
    onSuccess: () => { toast.success('Counselor updated!'); setEditTarget(null); qc.invalidateQueries({ queryKey: ['admin-counselors'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: counselorsApi.deleteCounselor,
    onSuccess: () => { toast.success('Counselor deleted'); setDeleteTarget(null); qc.invalidateQueries({ queryKey: ['admin-counselors'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const counselors = data?.counselors || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Counselors</h2>
          <p className="text-sm text-slate-400 mt-0.5">{counselors.length} counselor{counselors.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add Counselor</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={4} /> : counselors.length === 0 ? (
          <div className="text-center py-16">
            <UserRound size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No counselors yet. Add the first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Counselor</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden lg:table-cell">Address</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {counselors.map((c, idx) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <UserRound size={16} className="text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-200">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Phone size={11} className="text-slate-500 flex-shrink-0" />
                          {c.telephone}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={11} className="text-slate-500 flex-shrink-0" />
                            {c.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {c.address ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 max-w-[200px]">
                          <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={c.isActive ? 'green' : 'default'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(c)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Counselor">
        <CounselorForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Counselor">
        {editTarget && (
          <CounselorForm
            defaultValues={editTarget}
            onSubmit={(d) => updateMutation.mutate({ id: editTarget._id, data: d })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Counselor"
        message={`Remove "${deleteTarget?.name}"? They will no longer appear in the app.`}
      />
    </div>
  )
}
