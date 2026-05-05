import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts'
import api from '../../lib/api'
import { exportToCSV } from '../../lib/export'
import { Download } from 'lucide-react'

const PIE_COLORS = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4']

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [byUser, setByUser] = useState([])
  const [bySource, setBySource] = useState([])
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ov, bu, bs, tr] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/by-user'),
          api.get('/analytics/by-source'),
          api.get('/analytics/trend'),
        ])
        setOverview(ov.data)
        setByUser(bu.data)
        setBySource(bs.data)
        setTrend(tr.data.map(d => ({
          ...d,
          month: new Date(d.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          total: Number(d.total),
          converted: Number(d.converted),
        })))
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overviewBar = overview ? [
    { name: 'Total',     value: Number(overview.total) },
    { name: 'Converted', value: Number(overview.converted) },
    { name: 'Lost',      value: Number(overview.lost) },
    { name: 'Follow-up', value: Number(overview.in_progress) },
  ] : []

  if (loading) return <div className="p-6 text-sm text-slate-400">Loading analytics…</div>

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Analytics & Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">System-wide performance metrics</p>
        </div>
        <button
          onClick={() => exportToCSV(byUser, 'user-performance-report')}
          className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Lead Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overviewBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({ source, percent }) => `${source} ${(percent*100).toFixed(0)}%`}>
                {bySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Trend (last 12 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} dot={false} name="Converted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">User Performance</h3>
          <button onClick={() => exportToCSV(byUser, 'user-performance')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition">
            <Download size={12} /> CSV
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {['Name','Total Assigned','Converted','Lost','Conversion Rate'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {byUser.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{u.total_assigned}</td>
                <td className="px-4 py-3 tabular-nums text-green-600 font-medium">{u.converted}</td>
                <td className="px-4 py-3 tabular-nums text-red-500">{u.lost}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-24">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${u.conversion_rate || 0}%` }} />
                    </div>
                    <span className="tabular-nums text-slate-700 font-medium">{u.conversion_rate ?? 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
