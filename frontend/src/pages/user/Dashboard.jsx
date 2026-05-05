import { useState, useEffect } from 'react'
import api from '../../lib/api'
import SummaryCards from '../../components/dashboard/SummaryCards'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/leads?page=1')
        const leads = data.leads

        const counts = {
          total:          leads.length,
          follow_up:      leads.filter(l => l.status === 'follow_up').length,
          interested:     leads.filter(l => l.status === 'interested').length,
          not_interested: leads.filter(l => l.status === 'not_interested').length,
          converted:      leads.filter(l => l.status === 'converted').length,
          lost:           leads.filter(l => l.status === 'lost').length,
        }
        setStats(counts)

        const activityResults = await Promise.all(
          leads.slice(0, 5).map(l =>
            api.get(`/leads/${l.id}/activities`).then(r => r.data.map(a => ({ ...a, lead_name: l.name, lead_id: l.id })))
          )
        )
        const all = activityResults.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
        setActivities(all)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">My Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your assigned leads</p>
      </div>

      <SummaryCards stats={stats} />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
        </div>
        {loading
          ? <p className="text-sm text-slate-400 p-6">Loading…</p>
          : <ActivityFeed activities={activities} isAdmin={false} />
        }
      </div>
    </div>
  )
}
