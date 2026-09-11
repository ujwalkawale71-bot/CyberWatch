import { ShieldCheck, AlertTriangle, ShieldAlert, Clock, Calendar, Hash } from 'lucide-react'
import type { IOCInvestigationResult } from '../../types/threatIntelligence'

interface IndicatorResultCardProps {
  result: IOCInvestigationResult
}

export default function IndicatorResultCard({ result }: IndicatorResultCardProps) {
  const isMalicious = result.verdict === 'MALICIOUS'
  const isClean = result.verdict === 'CLEAN'

  const verdictBg = isMalicious
    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    : isClean
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-slate-800/80 border-slate-700 text-slate-400'

  const threatLevelColors: Record<string, string> = {
    CRITICAL: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    HIGH: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    LOW: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    CLEAN: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    UNASSESSED: 'text-slate-400 border-slate-700 bg-slate-800/60'
  }

  const levelColor = threatLevelColors[result.threat_level] || threatLevelColors.UNASSESSED

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Investigated Target
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {result.ioc_type}
            </span>
            {result.scan_id && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                <Hash className="w-2.5 h-2.5 text-slate-500" />
                Scan #{result.scan_id}
              </span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white break-all">
            {result.input_ioc || result.ioc}
          </div>
          {result.normalized_ioc && result.normalized_ioc !== result.input_ioc && (
            <div className="text-xs text-slate-500 font-mono">
              Normalized Query: <span className="text-slate-300">{result.normalized_ioc}</span>
            </div>
          )}
        </div>

        {/* Verdict Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 ${verdictBg}`}>
            {isMalicious ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : isClean ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">CyberWatch Verdict</div>
              <div className="text-sm font-extrabold tracking-wide">{result.verdict}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        {/* Risk Score */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Risk Score</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {result.risk_score}
            <span className="text-xs font-normal text-slate-500"> / 100</span>
          </div>
        </div>

        {/* Threat Level */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Threat Level</div>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${levelColor}`}>
              {result.threat_level}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Confidence</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {result.confidence.toFixed(0)}%
          </div>
        </div>

        {/* Detections / Feeds */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Feed Detections</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {result.feed_detections ?? result.stats.detected_sources}
            <span className="text-xs font-normal text-slate-500"> / {result.providers_checked ?? result.stats.executed_sources} queried</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {result.providers_available ?? result.stats.configured_sources} of {result.stats.total_sources} feeds configured
          </div>
        </div>
      </div>

      {/* Seen Timestamps (No mock data!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>First Seen:</span>
          <span className="font-mono text-slate-300">{result.first_seen}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Last Seen:</span>
          <span className="font-mono text-slate-300">{result.last_seen}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Evaluated At:</span>
          <span className="font-mono text-slate-300">{new Date(result.investigated_at).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}
