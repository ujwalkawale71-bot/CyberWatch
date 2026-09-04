import type { ThreatIntelMatch } from '../../types/urlScanner'

interface ThreatIntelMatchesProps {
  matches: ThreatIntelMatch[]
}

const typeColorStyles = {
  PHISHING: 'bg-red-500/10 text-red-400 border border-red-500/20',
  MALWARE: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  DECEPTIVE: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  MALICIOUS: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'
}

export default function ThreatIntelMatches({ matches }: ThreatIntelMatchesProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Threat Intelligence Matches</h2>
        <span className="text-xs text-slate-500 mt-1 block">Hits in global reputation feeds</span>
      </div>

      {/* Matches feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {matches.map((match) => {
          const badgeClass =
            typeColorStyles[match.type as keyof typeof typeColorStyles] ||
            'bg-slate-500/10 text-slate-450 border border-slate-800'

          return (
            <div
              key={match.id}
              className="p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors"
            >
              {/* Row 1: Source & Confidence */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">{match.source}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Confidence: <strong className="text-slate-300">{match.confidence}%</strong>
                </span>
              </div>

              {/* Row 2: Match value (URL/Domain/Message) */}
              <div className="text-[11px] text-slate-500 font-mono truncate mb-2 leading-relaxed">
                {match.matchValue}
              </div>

              {/* Row 3: Action Tag */}
              <div className="flex items-center">
                <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded leading-none ${badgeClass}`}>
                  {match.type}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
