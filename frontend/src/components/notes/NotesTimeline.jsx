import NoteItem from './NoteItem'

export default function NotesTimeline({ activities, loading }) {
  if (loading) return <p className="text-sm text-slate-400 py-4">Loading…</p>
  if (!activities.length) return <p className="text-sm text-slate-400 py-4">No activity yet.</p>

  return (
    <div className="divide-y divide-slate-100">
      {activities.map(a => (
        <NoteItem key={a.id} activity={a} />
      ))}
    </div>
  )
}
