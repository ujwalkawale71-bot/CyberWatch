import { ShieldAlert, Bug, ThumbsUp, Lock, Copy, TrendingUp } from 'lucide-react'
import type { SubScoreItem } from '../../types/urlScanner'
import { SEVERITY_COLORS } from '../../utils/constants'

interface SubScoreCardsProps {
  items: SubScoreItem[]
}

const iconMap = {
  'sub-phish': ShieldAlert,
  'sub-mal': Bug,
  'sub-rep': ThumbsUp,
  'sub-ssl': Lock,
  'sub-brand': Copy,
  'sub-trend': TrendingUp
}

export default function SubScoreCards({ items }: SubScoreCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[360px] md:h-auto lg:h-[360px]">
      {items.map((item) => {
        const IconComponent = iconMap[item.id as keyof typeof iconMap] || ShieldAlert
        const colorSet = SEVERITY_COLORS[item.severity]

        return (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all text-left"
          >
            {/* Top row: Icon and Severity Label */}
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded bg-slate-950/40 text-slate-400">
                <IconComponent className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-extrabold tracking-wider leading-none ${colorSet.text}`}>
                {item.id === 'sub-trend' ? 'TREND' : item.severity}
              </span>
            </div>

            {/* Bottom Row: Score/Trend values */}
            <div className="mt-3">
              {item.trend ? (
                <div className="text-sm font-bold text-red-400 tracking-tight flex items-center leading-none">
                  {item.trend}
                </div>
              ) : (
                <div className="text-2xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
                  {item.score}
                  <span className="text-xs text-slate-500 font-semibold font-sans">/{item.maxScore}</span>
                </div>
              )}
              <span className="text-[10px] font-semibold text-slate-500 block mt-1.5 uppercase tracking-wider truncate">
                {item.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
