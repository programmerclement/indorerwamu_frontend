import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Clock, Globe, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { articlesApi } from '@/api/articles'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Input, Textarea, Select, Toggle } from '@/components/ui/FormFields'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const CATEGORIES = ['wellness', 'anxiety', 'stress', 'sleep', 'mental-health']

function ArticleForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues || { title: '', content: '', category: 'wellness', readTime: 5, kinyarwandaAvailable: false }
  })
  const kw = watch('kinyarwandaAvailable')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Article title"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" {...register('category')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </Select>
        <Input
          label="Read Time (min)"
          type="number"
          min={1}
          {...register('readTime', { valueAsNumber: true })}
        />
      </div>
      <Textarea
        label="Content"
        placeholder="Full article content…"
        className="h-36"
        error={errors.content?.message}
        {...register('content', { required: 'Content is required' })}
      />
      <Toggle
        label="Kinyarwanda version available"
        checked={kw}
        onChange={(v) => setValue('kinyarwandaAvailable', v)}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Article'}
        </Button>
      </div>
    </form>
  )
}

export default function ArticlesPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: articlesApi.getArticles,
  })

  const createMutation = useMutation({
    mutationFn: articlesApi.createArticle,
    onSuccess: () => { toast.success('Article created!'); setCreateOpen(false); qc.invalidateQueries({ queryKey: ['admin-articles'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => articlesApi.updateArticle(id, data),
    onSuccess: () => { toast.success('Article updated!'); setEditTarget(null); qc.invalidateQueries({ queryKey: ['admin-articles'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: articlesApi.deleteArticle,
    onSuccess: () => { toast.success('Article deleted'); setDeleteTarget(null); qc.invalidateQueries({ queryKey: ['admin-articles'] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const articles = data?.articles || []

  const categoryColor = (cat) => {
    const map = { wellness: 'blue', anxiety: 'purple', stress: 'red', sleep: 'yellow', 'mental-health': 'green' }
    return map[cat] || 'default'
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Articles</h2>
          <p className="text-sm text-slate-400 mt-0.5">{articles.length} education resources</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>New Article</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={5} /> : articles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No articles yet. Create the first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Article</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Read Time</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase hidden lg:table-cell">Created</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {articles.map((a, idx) => (
                  <motion.tr
                    key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <BookOpen size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{a.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {a.kinyarwandaAvailable && (
                              <span className="text-xs text-green-400 flex items-center gap-0.5"><Globe size={10} />KW</span>
                            )}
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{a.content?.slice(0, 60)}…</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <Badge variant={categoryColor(a.category)}>{a.category}</Badge>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock size={12} />{a.readTime} min
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">{formatDate(a.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(a)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Article" size="lg">
        <ArticleForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Article" size="lg">
        {editTarget && <ArticleForm defaultValues={editTarget} onSubmit={(d) => updateMutation.mutate({ id: editTarget._id, data: d })} loading={updateMutation.isPending} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Article"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
