import { useEffect, useState } from 'react'
import { Mail, Phone, Save } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { apiClient } from '@/services/axios'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const qc = useQueryClient()
  const [supportEmail, setSupportEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiClient.get('/admin/settings').then((res) => res.data),
  })

  useEffect(() => {
    if (data) {
      setSupportEmail(data.supportEmail || '')
      setSupportPhone(data.supportPhone || '')
    }
  }, [data])

  const updateSettingsMutation = useMutation({
    mutationFn: (payload) => apiClient.put('/admin/settings', payload).then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message || 'Settings saved')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Unable to save settings'),
  })

  const handleSave = () => {
    updateSettingsMutation.mutate({ supportEmail, supportPhone })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader
          title="Support Contacts"
          subtitle="Manage the support details shown to users and admins"
        />
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Mail size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Support Email</p>
              <input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@example.com"
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Phone size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Telephone Number</p>
              <input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+250 788 000 000"
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <Button icon={Save} onClick={handleSave} loading={updateSettingsMutation.isPending} disabled={isLoading}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  )
}
