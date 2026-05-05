const CARDS = [
  { key: 'total',          label: 'Total Assigned',  color: 'border-l-blue-500',   num: 'text-blue-600' },
  { key: 'follow_up',      label: 'In Progress',     color: 'border-l-amber-500',  num: 'text-amber-600' },
  { key: 'interested',     label: 'Interested',      color: 'border-l-blue-400',   num: 'text-blue-500' },
  { key: 'not_interested', label: 'Not Interested',  color: 'border-l-slate-400',  num: 'text-slate-500' },
  { key: 'converted',      label: 'Converted',       color: 'border-l-green-500',  num: 'text-green-600' },
  { key: 'lost',           label: 'Lost',            color: 'border-l-red-500',    num: 'text-red-600' },
]

export default function SummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map(({ key, label, color, num }) => (
        <div key={key} className={`bg-white border border-slate-200 border-l-4 ${color} rounded-lg px-4 py-4`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl font-semibold tabular-nums ${num}`}>{stats?.[key] ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}
