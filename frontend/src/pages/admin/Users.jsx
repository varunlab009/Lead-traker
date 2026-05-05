import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import api from '../../lib/api'
import UserForm from '../../components/admin/UserForm'
import { formatDate, relativeTime } from '../../lib/format'
import { UserPlus, Pencil, UserX } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)

  async function fetchUsers() {
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleCreate(payload) {
    setSaving(true)
    try {
      await api.post('/users', payload)
      toast.success('User created')
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(payload) {
    setSaving(true)
    try {
      await api.patch(`/users/${editUser.id}`, payload)
      toast.success('User updated')
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(user) {
    if (!confirm(`Deactivate ${user.name}? Their leads will remain assigned.`)) return
    try {
      await api.delete(`/users/${user.id}`)
      toast.success('User deactivated')
      fetchUsers()
    } catch {
      toast.error('Failed to deactivate user')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} team members</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition"
        >
          <UserPlus size={15} /> Add User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {['Name','Email','Role','Leads','Converted','Last Login','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">Loading…</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{u.assigned_leads ?? 0}</td>
                <td className="px-4 py-3 tabular-nums text-green-600 font-medium">{u.converted_leads ?? 0}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.last_login ? relativeTime(u.last_login) : 'Never'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditUser(u)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition" title="Edit">
                      <Pencil size={13} />
                    </button>
                    {u.is_active && (
                      <button onClick={() => handleDeactivate(u)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Deactivate">
                        <UserX size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <UserForm onSubmit={handleCreate} onClose={() => setShowForm(false)} loading={saving} />}
      {editUser && <UserForm user={editUser} onSubmit={handleEdit} onClose={() => setEditUser(null)} loading={saving} />}
    </div>
  )
}
