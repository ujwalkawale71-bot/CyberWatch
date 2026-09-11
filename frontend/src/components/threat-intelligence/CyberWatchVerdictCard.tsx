import { FileText, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { IOCInvestigationResult } from '../../types/threatIntelligence'

interface CyberWatchVerdictCardProps {
  result: IOCInvestigationResult
}

export default function CyberWatchVerdictCard({ result }: CyberWatchVerdictCardProps) {
  const isMalicious = result.verdict === 'MALICIOUS'

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          CyberWatch Consensus & Evidence Synthesis
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic correlation of multi-feed detections and findings.
        </p>
      </div>

      <div className="space-y-3">
        {result.verdict_evidence.map((ev, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isMalicious
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}
          >
            {isMalicious ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{ev.source}</span>
                <span className="text-[10px] font-normal uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {ev.category}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                {ev.finding}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
