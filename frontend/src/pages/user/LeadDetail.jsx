import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/leads/StatusBadge'
import StatusDropdown from '../../components/leads/StatusDropdown'
import HotLeadBadge from '../../components/leads/HotLeadBadge'
import NotesTimeline from '../../components/notes/NotesTimeline'
import AddNoteForm from '../../components/notes/AddNoteForm'
import { formatDate } from '../../lib/format'
import { ArrowLeft } from 'lucide-react'

export default function LeadDetail() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [loadingLead, setLoadingLead] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [addingNote, setAddingNote] = useState(false)

  const fetchLead = useCallback(async () => {
    try {
      const { data } = await api.get(`/leads/${id}`)
      setLead(data)
    } catch {
      toast.error('Lead not found')
      navigate(-1)
    } finally {
      setLoadingLead(false)
    }
  }, [id, navigate])

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const { data } = await api.get(`/leads/${id}/activities`)
      setActivities(data)
    } finally {
      setLoadingActivities(false)
    }
  }, [id])

  useEffect(() => { fetchLead() }, [fetchLead])
  useEffect(() => { fetchActivities() }, [fetchActivities])

  useEffect(() => {
    const interval = setInterval(fetchActivities, 3000)
    return () => clearInterval(interval)
  }, [fetchActivities])

  async function handleStatusChange(newStatus) {
    setUpdatingStatus(true)
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus })
      toast.success('Status updated')
      fetchLead()
      fetchActivities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAddNote(comment) {
    setAddingNote(true)
    try {
      await api.post(`/leads/${id}/notes`, { comment })
      toast.success('Note added')
      fetchActivities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  if (loadingLead) return <div className="p-6 text-sm text-slate-400">Loading…</div>
  if (!lead) return null

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-lg font-semibold text-slate-900">{lead.name}</h2>
          {lead.is_hot_lead && <HotLeadBadge />}
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Lead Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Name', lead.name],
            ['Business Name', lead.business_name || '—'],
            ['Phone Number', lead.contact],
            ['Email', lead.email || '—'],
            ['City', lead.city || '—'],
            ['Niche', lead.niche || '—'],
            ['Address', lead.address || '—'],
            ['Source', lead.source || '—'],
            ['Assigned To', lead.assigned_user_name || 'Unassigned'],
            ['Assigned On', formatDate(lead.assigned_at)],
            ['Created', formatDate(lead.created_at)],
          ].map(([label, value]) => (
            <div key={label} className={label === 'Address' ? 'col-span-2 md:col-span-3' : ''}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm text-slate-800 mt-0.5 font-medium">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
          <StatusDropdown value={lead.status} onChange={handleStatusChange} disabled={updatingStatus} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Notes & Activity</h3>
        <AddNoteForm leadId={id} onSubmit={handleAddNote} loading={addingNote} />
        <div className="mt-4 border-t border-slate-100 pt-2">
          <NotesTimeline activities={activities} loading={loadingActivities && !activities.length} />
        </div>
      </div>
    </div>
  )
}
