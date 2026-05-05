import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../lib/api'
import LeadTable from '../../components/leads/LeadTable'
import LeadFilters from '../../components/leads/LeadFilters'
import Pagination from '../../components/ui/Pagination'
import AssignModal from '../../components/admin/AssignModal'

export default function AllLeads() {
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [users, setUsers] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [showAssign, setShowAssign] = useState(false)

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.filter(u => u.role === 'user' && u.is_active)))
  }, [])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (search)     params.set('search', search)
      if (status)     params.set('status', status)
      if (dateFrom)   params.set('dateFrom', dateFrom)
      if (dateTo)     params.set('dateTo', dateTo)
      if (assignedTo) params.set('assignedTo', assignedTo)
      const { data } = await api.get(`/leads?${params}`)
      setLeads(data.leads)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page, search, status, dateFrom, dateTo, assignedTo])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(1) }, [search, status, dateFrom, dateTo, assignedTo])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">{total} total leads</p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setShowAssign(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition"
          >
            Assign {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      <LeadFilters
        search={search} onSearch={setSearch}
        status={status} onStatus={setStatus}
        dateFrom={dateFrom} onDateFrom={setDateFrom}
        dateTo={dateTo} onDateTo={setDateTo}
        users={users} assignedTo={assignedTo} onAssignedTo={setAssignedTo}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <LeadTable
          leads={leads} loading={loading} isAdmin={true}
          selectedIds={selectedIds} onSelectChange={setSelectedIds}
        />
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </div>

      {showAssign && (
        <AssignModal
          leadIds={selectedIds}
          users={users}
          onSuccess={() => { setShowAssign(false); setSelectedIds([]); fetchLeads() }}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  )
}
