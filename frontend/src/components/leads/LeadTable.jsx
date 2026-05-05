import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import HotLeadBadge from './HotLeadBadge'
import { relativeTime } from '../../lib/format'

export default function LeadTable({ leads, isAdmin, onSelectChange, selectedIds, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
        Loading leads…
      </div>
    )
  }

  if (!leads.length) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
        No leads found.
      </div>
    )
  }

  function toggleSelect(id) {
    if (!onSelectChange) return
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]
    onSelectChange(next)
  }

  function toggleAll() {
    if (!onSelectChange) return
    onSelectChange(selectedIds.length === leads.length ? [] : leads.map(l => l.id))
  }

  const detailPath = (id) => isAdmin ? `/admin/leads/${id}` : `/leads/${id}`

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            {onSelectChange && (
              <th className="px-4 py-2.5 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === leads.length && leads.length > 0}
                  onChange={toggleAll}
                  className="rounded border-slate-300"
                />
              </th>
            )}
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            {isAdmin && (
              <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
            )}
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Updated</th>
            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map(lead => (
            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
              {onSelectChange && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    className="rounded border-slate-300"
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-medium text-slate-900 hover:text-blue-600 cursor-pointer"
                    onClick={() => navigate(detailPath(lead.id))}
                  >
                    {lead.name}
                  </span>
                  {lead.is_hot_lead && <HotLeadBadge />}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{lead.business_name || <span className="text-slate-300">—</span>}</td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs">{lead.contact}</td>
              <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
              {isAdmin && (
                <td className="px-4 py-3 text-slate-600">
                  {lead.assigned_user_name || <span className="text-slate-400 italic">Unassigned</span>}
                </td>
              )}
              <td className="px-4 py-3 text-slate-500 text-xs">{relativeTime(lead.updated_at)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(detailPath(lead.id))}
                  className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-600 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
