import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, UserPlus, Shield, Ban, Trash2, Eye,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react'
import { usersApi } from '@/api/users'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const FILTERS = [
  { value: 'all',       label: 'All Users' },
  { value: 'active',    label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'admin',     label: 'Admins' },
]

function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function UsersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' })

  const debouncedSearch = useDebounce(search)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch, filter],
    queryFn: () => usersApi.getUsers({ page, limit: 15, search: debouncedSearch, filter }),
    keepPreviousData: true,
  })

  const suspendMutation = useMutation({
    mutationFn: (id) => usersApi.suspendUser(id),
    onSuccess: (res) => {
      toast.success(res.message)
      setSuspendTarget(null)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => usersApi.resetPassword(id, password),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset successfully')
      setResetTarget(null)
      setNewPassword('')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password reset failed'),
  })

  const createAdminMutation = useMutation({
    mutationFn: (payload) => usersApi.createAdmin(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Admin account created successfully')
      setCreateAdminOpen(false)
      setAdminForm({ name: '', email: '', password: '' })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Unable to create admin account'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const users = data?.users || []
  const pagination = data?.pagination

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const handleSuspendConfirm = () => {
    if (!suspendTarget) return
    suspendMutation.mutate(suspendTarget._id)
  }

  const handleResetConfirm = () => {
    if (!resetTarget) return
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    resetPasswordMutation.mutate({ id: resetTarget._id, password: newPassword })
  }

  const handleCreateAdmin = () => {
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (adminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    createAdminMutation.mutate({
      name: adminForm.name.trim(),
      email: adminForm.email.trim().toLowerCase(),
      password: adminForm.password,
      language: 'en',
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {pagination ? `${pagination.total} total users` : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={UserPlus}
            variant="primary"
            size="sm"
            onClick={() => setCreateAdminOpen(true)}
          >
            Add Admin
          </Button>
          <Button
            icon={RefreshCw}
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ['admin-users'] })}
            loading={isFetching}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters + Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name or email…"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-700/50 rounded-xl p-1">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === f.value
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserPlus size={32} className="text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No users found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Language</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                            {user.name}
                            {user.isAdmin && <Shield size={12} className="text-blue-400" />}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <Badge variant="default">{user.language === 'rw' ? '🇷🇼 Kinyarwanda' : '🌍 English'}</Badge>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      {user.isSuspended ? (
                        <Badge variant="red">Suspended</Badge>
                      ) : user.isAdmin ? (
                        <Badge variant="blue">Admin</Badge>
                      ) : (
                        <Badge variant="green">Active</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/users/${user._id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setSuspendTarget(user)}
                          disabled={suspendMutation.isPending}
                          className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                          title={user.isSuspended ? 'Activate' : 'Suspend'}
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setResetTarget(user)
                            setNewPassword('')
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Reset Password"
                        >
                          <RefreshCw size={15} />
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.pages} · {pagination.total} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" icon={ChevronLeft}
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              >Prev</Button>
              <Button
                variant="outline" size="sm"
                disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
              >Next <ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Suspend Confirm */}
      <ConfirmModal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        loading={suspendMutation.isPending}
        title={suspendTarget?.isSuspended ? 'Activate User' : 'Suspend User'}
        message={suspendTarget?.isSuspended
          ? `Are you sure you want to activate "${suspendTarget?.name}"?`
          : `Are you sure you want to suspend "${suspendTarget?.name}"?`}
        confirmLabel={suspendTarget?.isSuspended ? 'Activate User' : 'Suspend User'}
      />

      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null)
          setNewPassword('')
        }}
        title="Reset Password"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Set a new password for <span className="font-medium text-slate-200">{resetTarget?.name}</span>.
          </p>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a secure password"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setResetTarget(null)
              setNewPassword('')
            }}>Cancel</Button>
            <Button variant="primary" onClick={handleResetConfirm} loading={resetPasswordMutation.isPending}>
              Save Password
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={createAdminOpen}
        onClose={() => {
          setCreateAdminOpen(false)
          setAdminForm({ name: '', email: '', password: '' })
        }}
        title="Create Admin Account"
        size="sm"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Full name</span>
            <input
              type="text"
              value={adminForm.name}
              onChange={(e) => setAdminForm((value) => ({ ...value, name: e.target.value }))}
              placeholder="Enter admin name"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm((value) => ({ ...value, email: e.target.value }))}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Temporary password</span>
            <input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm((value) => ({ ...value, password: e.target.value }))}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateAdminOpen(false)
                setAdminForm({ name: '', email: '', password: '' })
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAdmin} loading={createAdminMutation.isPending}>
              Create Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All their data (moods, completions, rewards) will also be removed.`}
        confirmLabel="Delete User"
      />
    </div>
  )
}
