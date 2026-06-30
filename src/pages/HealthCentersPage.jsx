import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Building2, Phone, MapPin, Navigation } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { healthCentersApi } from '@/api/healthcenters'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/FormFields'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

function HealthCenterForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { name: '', address: '', telephone: '', latitude: '', longitude: '' }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Center Name"
        placeholder="e.g. Kigali University Teaching Hospital"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <Textarea
        label="Address"
        placeholder="e.g. KN 4 Ave, Kigali, Rwanda"
        rows={2}
        {...register('address')}
      />
      <Input
        label="Telephone (optional)"
        placeholder="+250 7XX XXX XXX"
        {...register('telephone')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          type="number"
          step="any"
          placeholder="-1.9441"
          error={errors.latitude?.message}
          {...register('latitude', {
            required: 'Latitude is required',
            validate: v => (v >= -90 && v <= 90) || 'Must be between -90 and 90'
          })}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          placeholder="30.0619"
          error={errors.longitude?.message}
          {...register('longitude', {
            required: 'Longitude is required',
            validate: v => (v >= -180 && v <= 180) || 'Must be between -180 and 180'
          })}
        />
      </div>
      <p className="text-xs text-slate-500">
        Tip: right-click any location on{' '}
        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
          Google Maps
        </a>{' '}
        to copy its coordinates.
      </p>
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
          {defaultValues ? 'Save Changes' : 'Add Center'}
        </Button>
      </div>
    </form>
  )
}

export default function HealthCentersPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-healthcenters'],
    queryFn: healthCentersApi.getHealthCenters,
  })

  const createMutation = useMutation({
    mutationFn: healthCentersApi.createHealthCenter,
    onSuccess: () => { toast.success('Health center added!'); setCreateOpen(false); qc.invalidateQueries({ queryKey: ['admin-healthcenters'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => healthCentersApi.updateHealthCenter(id, data),
    onSuccess: () => { toast.success('Health center updated!'); setEditTarget(null); qc.invalidateQueries({ queryKey: ['admin-healthcenters'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: healthCentersApi.deleteHealthCenter,
    onSuccess: () => { toast.success('Health center deleted'); setDeleteTarget(null); qc.invalidateQueries({ queryKey: ['admin-healthcenters'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const centers = data?.centers || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Health Centers</h2>
          <p className="text-sm text-slate-400 mt-0.5">{centers.length} center{centers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add Center</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={4} /> : centers.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No health centers yet. Add the first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Center</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Coordinates</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {centers.map((c, idx) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-teal-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{c.name}</p>
                          {c.address && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                              <MapPin size={10} />
                              <span className="truncate max-w-[180px]">{c.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      {c.telephone ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Phone size={11} className="text-slate-500" />
                          {c.telephone}
                        </div>
                      ) : <span className="text-xs text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <a
                        href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Navigation size={11} />
                        {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                      </a>
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Health Center">
        <HealthCenterForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Health Center">
        {editTarget && (
          <HealthCenterForm
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
        title="Delete Health Center"
        message={`Remove "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
