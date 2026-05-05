import { STATUS_LIST, STATUS_LABELS } from '../../lib/format'

export default function LeadFilters({ search, onSearch, status, onStatus, dateFrom, onDateFrom, dateTo, onDateTo, users, assignedTo, onAssignedTo }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search name or contact…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-52"
      />
      <select
        value={status}
        onChange={e => onStatus(e.target.value)}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        {STATUS_LIST.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      {users && (
        <select
          value={assignedTo}
          onChange={e => onAssignedTo(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      )}
      <input
        type="date"
        value={dateFrom}
        onChange={e => onDateFrom(e.target.value)}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-blue-500"
      />
      <span className="text-slate-400 text-sm">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={e => onDateTo(e.target.value)}
        className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white text-slate-700 outline-none focus:border-blue-500"
      />
    </div>
  )
}
