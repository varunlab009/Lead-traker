import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, List, BarChart2, Users, Upload, UserCog, LogOut } from 'lucide-react'

const USER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads',     label: 'My Leads',  icon: List },
]

const ADMIN_NAV = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/leads',      label: 'All Leads',    icon: List },
  { to: '/admin/assign',     label: 'Assign Leads', icon: Users },
  { to: '/admin/upload',     label: 'Upload CSV',   icon: Upload },
  { to: '/admin/users',      label: 'Users',        icon: UserCog },
  { to: '/admin/analytics',  label: 'Analytics',    icon: BarChart2 },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const nav = isAdmin ? ADMIN_NAV : USER_NAV

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-5 py-4 border-b border-slate-200">
        <h1 className="font-semibold text-blue-600 text-base tracking-tight">LeadTrack Pro</h1>
        <p className="text-xs text-slate-500 mt-0.5">{user?.name} · {user?.role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors
               ${isActive
                 ? 'bg-blue-600 text-white font-medium'
                 : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
            }>
            <Icon size={15} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
