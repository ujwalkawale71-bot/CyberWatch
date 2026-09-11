import { Link } from 'react-router-dom'
import { Link2, Globe, ShieldAlert, Network, CheckCircle2 } from 'lucide-react'
import type { IntelSource } from '../../data/overviewData'

const feedIcons = {
  'feed-1': Link2,
  'feed-2': Globe,
  'feed-3': ShieldAlert,
  'feed-4': Network
}

interface ThreatIntelFeedProps {
  feeds?: IntelSource[]
}

export default function ThreatIntelFeed({ feeds }: ThreatIntelFeedProps) {
  const sources = feeds || [
    { id: 'feed-1', name: 'URLhaus Database', count: 'Live URL API query active', updatedMinutesAgo: 2 },
    { id: 'feed-2', name: 'PhishTank Database', count: 'Live PhishTank API query active', updatedMinutesAgo: 5 },
    { id: 'feed-3', name: 'VirusTotal Feed', count: 'Multi-engine malware reputation', updatedMinutesAgo: 12 },
    { id: 'feed-4', name: 'Google Safe Browsing', count: 'Cloud threat protection feed', updatedMinutesAgo: 15 }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Threat Intelligence Feed</h2>
          <span className="text-xs text-slate-500 mt-1 block">External indicators database</span>
        </div>
        <Link
          to="/threat-intelligence"
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Feed list */}
      <div className="flex-1 my-3 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {sources.map((source) => {
          const IconComponent = feedIcons[source.id as keyof typeof feedIcons] || ShieldAlert
          return (
            <div
              key={source.id}
              className="flex items-start justify-between p-2 rounded-lg bg-slate-950/20 border border-slate-850"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-1.5 rounded bg-slate-800 text-slate-400 flex-shrink-0">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-200 truncate">{source.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {source.count}
                  </p>
                </div>
              </div>
              <span className="text-[9px] text-slate-600 font-semibold whitespace-nowrap pt-1">
                updated {source.updatedMinutesAgo}m ago
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer status summary */}
      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Multi-vendor threat intelligence integrations active</span>
      </div>
    </div>
  )
}
