import { useNavigate } from 'react-router-dom'
import { relativeTime } from '../../lib/format'

export default function ActivityFeed({ activities, isAdmin }) {
  const navigate = useNavigate()

  if (!activities.length) {
    return <p className="text-sm text-slate-400 py-6 text-center">No recent activity.</p>
  }

  return (
    <div className="divide-y divide-slate-100">
      {activities.map(a => (
        <div
          key={a.id}
          onClick={() => navigate(isAdmin ? `/admin/leads/${a.lead_id}` : `/leads/${a.lead_id}`)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">{a.user_name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 truncate">
              <span className="font-medium">{a.lead_name || 'Lead'}</span>
              {' · '}
              <span className="text-slate-500">
                {a.activity_type === 'status_change'
                  ? `Status → ${a.new_status}`
                  : a.comment?.slice(0, 50)}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{a.user_name} · {relativeTime(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
