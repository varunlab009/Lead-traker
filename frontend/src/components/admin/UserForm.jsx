import { useState } from 'react'
import { X } from 'lucide-react'

export default function UserForm({ user, onSubmit, onClose, loading }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.role || 'user')

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { name, email, role }
    if (!user) payload.password = password
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">{user ? 'Edit User' : 'Create User'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', value: name, onChange: setName, type: 'text', required: true },
            { label: 'Email', value: email, onChange: setEmail, type: 'email', required: true },
            ...(!user ? [{ label: 'Password', value: password, onChange: setPassword, type: 'password', required: true }] : []),
          ].map(({ label, value, onChange, type, required }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500">
              <option value="user">Sales Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition">
              {loading ? 'Saving…' : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
