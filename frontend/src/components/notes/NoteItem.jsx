import { relativeTime } from '../../lib/format'

export default function NoteItem({ activity }) {
  const isStatus = activity.activity_type === 'status_change'

  if (isStatus) {
    return (
      <div className="flex items-start gap-3 py-3">
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs text-slate-500">↔</span>
        </div>
        <div>
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{activity.user_name}</span>
            {' changed status: '}
            <span className="font-medium">{activity.old_status}</span>
            {' → '}
            <span className="font-medium text-blue-600">{activity.new_status}</span>
            {' · '}
            {relativeTime(activity.created_at)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs text-white font-bold">{activity.user_name?.[0]?.toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-800">{activity.user_name}</span>
          <span className="text-xs text-slate-400">{relativeTime(activity.created_at)}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{activity.comment}</p>
      </div>
    </div>
  )
}
