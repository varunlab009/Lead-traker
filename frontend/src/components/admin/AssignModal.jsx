import { useState } from 'react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { X } from 'lucide-react'

export default function AssignModal({ leadIds, users, onSuccess, onClose }) {
  const [userId, setUserId] = useState('')
  const [autoAssign, setAutoAssign] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!autoAssign && !userId) return toast.error('Select a user or choose auto-assign')
    setLoading(true)
    try {
      if (autoAssign) {
        await api.post('/leads/auto-assign', { leadIds })
      } else {
        await api.post('/leads/assign', { leadIds, userId })
      }
      toast.success(`${leadIds.length} lead${leadIds.length > 1 ? 's' : ''} assigned`)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assignment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Assign {leadIds.length} Lead{leadIds.length > 1 ? 's' : ''}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={e => { setAutoAssign(e.target.checked); setUserId('') }}
              className="rounded border-slate-300"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Auto-assign (round-robin)</p>
              <p className="text-xs text-slate-500">Distributes evenly across active sales agents</p>
            </div>
          </label>

          {!autoAssign && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Assign to
              </label>
              <select
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a user…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.assigned_leads ?? 0} leads)</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition"
          >
            {loading ? 'Assigning…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
