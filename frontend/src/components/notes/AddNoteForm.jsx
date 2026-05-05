import { useState, useEffect } from 'react'

export default function AddNoteForm({ leadId, onSubmit, loading }) {
  const draftKey = `draft_note_${leadId}`
  const [comment, setComment] = useState(() => localStorage.getItem(draftKey) || '')

  useEffect(() => {
    localStorage.setItem(draftKey, comment)
  }, [comment, draftKey])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    await onSubmit(comment.trim())
    setComment('')
    localStorage.removeItem(draftKey)
  }

  function prefill(text) {
    setComment(prev => prev ? prev + '\n' + text : text)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => prefill('Follow-up: ')}
          className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition"
        >
          + Follow-up Note
        </button>
        <button
          type="button"
          onClick={() => prefill('Call update: ')}
          className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition"
        >
          + After Call Update
        </button>
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Add a note…"
        rows={3}
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
      />
      <button
        type="submit"
        disabled={loading || !comment.trim()}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition"
      >
        {loading ? 'Adding…' : 'Add Note'}
      </button>
    </form>
  )
}
