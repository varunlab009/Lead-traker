import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import LeadTable from '../../components/leads/LeadTable'
import LeadFilters from '../../components/leads/LeadFilters'
import Pagination from '../../components/ui/Pagination'

export default function MyLeads() {
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (search)   params.set('search', search)
      if (status)   params.set('status', status)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo)   params.set('dateTo', dateTo)
      const { data } = await api.get(`/leads?${params}`)
      setLeads(data.leads)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page, search, status, dateFrom, dateTo])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(1) }, [search, status, dateFrom, dateTo])

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">My Leads</h2>
        <p className="text-sm text-slate-500 mt-0.5">{total} leads assigned to you</p>
      </div>

      <LeadFilters
        search={search} onSearch={setSearch}
        status={status} onStatus={setStatus}
        dateFrom={dateFrom} onDateFrom={setDateFrom}
        dateTo={dateTo} onDateTo={setDateTo}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <LeadTable leads={leads} loading={loading} isAdmin={false} />
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </div>
    </div>
  )
}
