export const STATUS_COLORS = {
  interested:     'bg-blue-50 text-blue-700 border border-blue-200',
  not_interested: 'bg-slate-100 text-slate-600 border border-slate-200',
  follow_up:      'bg-amber-50 text-amber-700 border border-amber-200',
  converted:      'bg-green-50 text-green-700 border border-green-200',
  lost:           'bg-red-50 text-red-700 border border-red-200',
}

export const STATUS_LABELS = {
  interested:     'Interested',
  not_interested: 'Not Interested',
  follow_up:      'Follow-up',
  converted:      'Converted',
  lost:           'Lost',
}

export const STATUS_LIST = ['interested', 'not_interested', 'follow_up', 'converted', 'lost']

export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
