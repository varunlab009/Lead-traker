import { STATUS_LIST, STATUS_LABELS } from '../../lib/format'

export default function StatusDropdown({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
    >
      {STATUS_LIST.map(s => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}
