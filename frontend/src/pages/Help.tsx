import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import HelpSearchCard from '../components/help/HelpSearchCard'
import HelpTopicsGrid from '../components/help/HelpTopicsGrid'
import GuidesCard from '../components/help/GuidesCard'
import VideoTutorialsCard from '../components/help/VideoTutorialsCard'
import SystemStatusCard from '../components/help/SystemStatusCard'
import SupportTicketsCard from '../components/help/SupportTicketsCard'
import ContactSupportCard from '../components/help/ContactSupportCard'
import {
  helpTopics,
  helpGuides,
  helpVideos,
  supportTickets,
  contactOptions
} from '../data/helpDemoData'

export default function Help() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (message: string) => {
    setToastMsg(message)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const handleSearch = (query: string) => {
    handleAction(`Query "${query}" searched against knowledge base`)
  }

  const handleDownload = (title: string) => {
    handleAction(`Download for reference manual "${title}" initiated`)
  }

  const handleWatch = (title: string) => {
    handleAction(`Playing tutorial video "${title}"`)
  }

  const handleContact = (label: string) => {
    handleAction(`This feature is not yet connected - coming soon (Option: ${label})`)
  }

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-800/40 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          We're here to help you secure your digital world.
        </p>
      </div>

      {/* Row 1: Search Header Block */}
      <HelpSearchCard onSearch={handleSearch} />

      {/* Row 2: Grid of Help Topics */}
      <div className="space-y-3">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block pl-1">
          Help Topics
        </span>
        <HelpTopicsGrid topics={helpTopics} />
      </div>

      {/* Row 3: Guides + Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuidesCard guides={helpGuides} onDownload={handleDownload} />
        <VideoTutorialsCard videos={helpVideos} onWatch={handleWatch} />
      </div>

      {/* Row 4: System Status + Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemStatusCard />
        <SupportTicketsCard tickets={supportTickets} onAction={handleAction} />
      </div>

      {/* Row 5: Contact Support Channels */}
      <ContactSupportCard options={contactOptions} onContact={handleContact} />
    </div>
  )
}
