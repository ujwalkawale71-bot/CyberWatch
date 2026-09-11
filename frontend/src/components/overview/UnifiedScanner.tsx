import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Globe, Puzzle, Network, Cpu, ShieldAlert, Activity, Sparkles } from 'lucide-react'

type TabType = 'url' | 'website' | 'extension' | 'ip'

export default function UnifiedScanner() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('url')
  const [inputValue, setInputValue] = useState('')

  const tabs = [
    { id: 'url' as TabType, label: 'URL / Domain', icon: Link2, placeholder: 'Enter URL or Domain (e.g., https://secure-login.com)' },
    { id: 'website' as TabType, label: 'Website', icon: Globe, placeholder: 'Enter Website IP or domain (e.g., 104.244.42.1)' },
    { id: 'extension' as TabType, label: 'Extension ID', icon: Puzzle, placeholder: 'Enter Chrome/Edge Extension ID or Web Store URL' },
    { id: 'ip' as TabType, label: 'IP Address', icon: Network, placeholder: 'Enter IPv4 or IPv6 Address (e.g., 8.8.8.8)' }
  ]

  const activeInfo = tabs.find((t) => t.id === activeTab) || tabs[0]

  const featureBadges = [
    { label: 'AI Risk Scoring', icon: Sparkles },
    { label: 'Threat Intelligence', icon: ShieldAlert },
    { label: 'Behavior Analysis', icon: Activity },
    { label: 'Explainable AI', icon: Cpu }
  ]

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return

    if (activeTab === 'url') {
      navigate(`/url-scanner?url=${encodeURIComponent(trimmed)}`)
    } else if (activeTab === 'website' || activeTab === 'ip') {
      navigate(`/website-scanner?target=${encodeURIComponent(trimmed)}`)
    } else if (activeTab === 'extension') {
      navigate(`/extension-scanner?target=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Unified Threat Scanner</h2>
        <span className="text-xs text-slate-500 mt-1 block">
          Start a new scan for comprehensive threat analysis
        </span>
      </div>

      {/* Tabs list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/65 rounded-lg border border-slate-800/40">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setInputValue('')
              }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Scanner Input and Button */}
      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={activeInfo.placeholder}
            className="w-full py-2.5 px-4 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-blue-500/10 active:scale-[0.99]"
        >
          Analyze
        </button>
      </form>

      {/* Feature Badges list */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/40">
        {featureBadges.map((badge) => {
          const BadgeIcon = badge.icon
          return (
            <div
              key={badge.label}
              className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-950/40 border border-slate-800/60 text-[10px] text-slate-400 font-medium"
            >
              <BadgeIcon className="w-3 h-3 text-blue-500/80" />
              <span>{badge.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
