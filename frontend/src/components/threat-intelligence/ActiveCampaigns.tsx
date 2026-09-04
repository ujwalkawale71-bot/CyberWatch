import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'
import { SEVERITY_COLORS } from '../../utils/constants'

const typeBadgeStyles = {
  PHISHING: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  MALWARE: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
  EXTENSION: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/25',
  DOMAIN: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
}

export default function ActiveCampaigns() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Active Threat Campaigns</h2>
          <span className="text-xs text-slate-500 mt-1 block">Global operations active indicators</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Campaigns list */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {threatIntelligenceDemoData.activeCampaigns.map((camp) => {
          const typeStyle = typeBadgeStyles[camp.type] || 'bg-slate-800 text-slate-400 border border-slate-700'
          const riskStyle = SEVERITY_COLORS[camp.severity] || SEVERITY_COLORS.LOW

          return (
            <div key={camp.id} className="p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors space-y-1.5">
              {/* Campaign name + badges */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-200 truncate flex-1">{camp.name}</h3>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${typeStyle}`}>
                    {camp.type}
                  </span>
                  <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                    {camp.severity}
                  </span>
                </div>
              </div>

              {/* Detail message */}
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                {camp.details}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
