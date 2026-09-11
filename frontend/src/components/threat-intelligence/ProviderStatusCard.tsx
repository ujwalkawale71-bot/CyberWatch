import { Radio, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import type { ProviderStatus } from '../../types/threatIntelligence'

interface ProviderStatusCardProps {
  providers: ProviderStatus[]
}

export default function ProviderStatusCard({ providers }: ProviderStatusCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          Threat Feed Providers Status
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Live configuration and operational health of connected threat intelligence APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {providers.map((p) => {
          const isOnline = p.operational_status === 'ONLINE' || p.operational_status === 'AVAILABLE'

          return (
            <div
              key={p.name}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white">{p.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isOnline ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-500" />
                    )}
                    {p.operational_status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 leading-snug">
                  {p.description}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {p.supported_iocs.map((ioc) => (
                    <span
                      key={ioc}
                      className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[9px] font-mono"
                    >
                      {ioc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Auth: {p.auth_required ? 'API Key Required' : 'Public Access'}</span>
                <a
                  href={p.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 inline-flex items-center gap-0.5 transition-colors"
                >
                  <span>API Docs</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
