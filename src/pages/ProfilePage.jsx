import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, ShieldCheck, Lock, Save } from 'lucide-react'
import { apiClient } from '@/services/axios'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '' })

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.put('/admin/profile', payload)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully')
      if (data.user) {
        login(localStorage.getItem('token'), { ...user, ...data.user })
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Unable to update profile'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    const payload = { name: form.name.trim() }
    if (form.currentPassword || form.newPassword) {
      if (!form.currentPassword || !form.newPassword) {
        toast.error('Please provide both current and new password')
        return
      }
      if (form.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters')
        return
      }
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    updateProfileMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">{user?.name || 'Admin User'}</h2>
              <p className="text-sm text-slate-400">Administrator account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-100">Account details</h3>
              <p className="text-sm text-slate-400">Update your admin profile information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                placeholder="Enter your name"
              />
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500">Email</label>
              <p className="mt-2 font-medium text-slate-100">{user?.email || 'admin@example.com'}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500">Current password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((value) => ({ ...value, currentPassword: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500">New password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((value) => ({ ...value, newPassword: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                placeholder="Enter new password"
              />
            </div>
            <Button type="submit" icon={Save} loading={updateProfileMutation.isPending}>
              Save changes
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-100">Security</h3>
              <p className="text-sm text-slate-400">Manage your access level</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-100">Admin access</p>
                <p className="text-sm text-slate-400">You are signed in as an administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
