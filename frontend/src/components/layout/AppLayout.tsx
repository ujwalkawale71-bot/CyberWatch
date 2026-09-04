import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#111315] text-[#F1F3F4] flex font-sans antialiased">
      {/* Sidebar (drawer on mobile, side dock on lg screens) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 min-h-screen">
        {/* Header */}
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Scrollable page body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
