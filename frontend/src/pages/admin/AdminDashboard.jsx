import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import { formatDate, relativeTime } from '../../lib/format'

const ADMIN_CARDS = [
  { key: 'total',          label: 'Total Leads',     color: 'border-l-blue-500',   num: 'text-blue-600' },
  { key: 'unassigned',     label: 'Unassigned',      color: 'border-l-slate-400',  num: 'text-slate-500' },
  { key: 'in_progress',    label: 'In Progress',     color: 'border-l-amber-500',  num: 'text-amber-600' },
  { key: 'interested',     label: 'Interested',      color: 'border-l-blue-400',   num: 'text-blue-500' },
  { key: 'converted',      label: 'Converted',       color: 'border-l-green-500',  num: 'text-green-600' },
  { key: 'lost',           label: 'Lost',            color: 'border-l-red-500',    num: 'text-red-600' },
]

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [ov, us, leads] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/users'),
          api.get('/leads?page=1'),
        ])
        setOverview(ov.data)
        setUsers(us.data)

        const activityResults = await Promise.all(
          leads.data.leads.slice(0, 5).map(l =>
            api.get(`/leads/${l.id}/activities`).then(r =>
              r.data.map(a => ({ ...a, lead_name: l.name, lead_id: l.id }))
            )
          )
        )
        const all = activityResults.flat()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
        setRecentActivities(all)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">System-wide overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {ADMIN_CARDS.map(({ key, label, color, num }) => (
          <div key={key} className={`bg-white border border-slate-200 border-l-4 ${color} rounded-lg px-4 py-4`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-semibold tabular-nums ${num}`}>{overview?.[key] ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Team Activity</h3>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-blue-600 hover:underline">Manage users →</button>
          </div>
          {loading ? <p className="text-sm text-slate-400 p-6">Loading…</p> : (
            <div className="divide-y divide-slate-100">
              {users.filter(u => u.role === 'user').map(u => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-600">{u.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">Last login: {u.last_login ? relativeTime(u.last_login) : 'Never'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums text-slate-700">{u.assigned_leads ?? 0}</p>
                    <p className="text-xs text-slate-400">leads</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
          </div>
          {loading ? <p className="text-sm text-slate-400 p-6">Loading…</p> : (
            <ActivityFeed activities={recentActivities} isAdmin={true} />
          )}
        </div>
      </div>
    </div>
  )
}
