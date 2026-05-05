import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'sonner'

export default function Shell() {
  return (
    <div className="flex min-h-screen bg-[#faf8ff]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
