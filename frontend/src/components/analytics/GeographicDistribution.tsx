import { Globe } from 'lucide-react'
import { analyticsDemoData } from '../../data/analyticsDemoData'

export default function GeographicDistribution() {
  const mapMarkers = [
    { x: '18%', y: '32%' },
    { x: '25%', y: '42%' },
    { x: '48%', y: '30%' },
    { x: '54%', y: '36%' },
    { x: '75%', y: '35%' },
    { x: '82%', y: '45%' },
    { x: '35%', y: '68%' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Geographic Distribution</h2>
        <span className="text-xs text-slate-500 mt-1 block">Threat density mappings by country location</span>
      </div>

      {/* Grid split map & table */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6 min-h-0 mt-4">
        {/* Left: Map viewport */}
        <div className="relative flex-1 w-full h-[180px] sm:h-full bg-slate-950/40 border border-slate-850 rounded-lg overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full opacity-10 text-slate-500 pointer-events-none"
            viewBox="0 0 400 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <path d="M 60 50 Q 90 55 110 45 T 150 80 T 165 100 Q 140 110 110 105 Z" />
            <path d="M 200 40 Q 230 35 260 45 T 290 65 T 330 50 Q 350 60 340 80 T 305 110 Z" />
            <path d="M 125 120 Q 135 130 130 150 Q 110 160 95 140 Z" />
            <path d="M 210 90 Q 235 100 225 125 Q 205 130 200 110 Z" />
            <path d="M 310 125 Q 330 130 325 150 Q 300 145 305 130 Z" />
          </svg>

          {/* Rotating Globe Watermark */}
          <Globe className="w-16 h-16 text-slate-800/10 animate-[spin_100s_linear_infinite]" />

          {/* Map markers */}
          {mapMarkers.map((marker, idx) => (
            <div key={idx} className="absolute" style={{ left: marker.x, top: marker.y }}>
              <span className="absolute -left-1.5 -top-1.5 w-4.5 h-4.5 rounded-full bg-blue-500/25 animate-ping" />
              <span className="relative block w-1.5 h-1.5 rounded-full bg-blue-500 border border-blue-300" />
            </div>
          ))}

          {/* Low to High density legend */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-850 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-medium">
            <span>Low</span>
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-500" />
            <span>High</span>
          </div>
        </div>

        {/* Right: Table list */}
        <div className="w-full sm:w-[190px] overflow-y-auto max-h-full pr-1 scrollbar-thin scrollbar-thumb-slate-800 space-y-2">
          {analyticsDemoData.geo.map((row) => (
            <div key={row.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-850/50 last:border-0 last:pb-0 gap-3">
              <span className="text-slate-400 font-medium truncate">{row.country}</span>
              <span className="font-mono text-slate-200 font-bold tabular-nums">
                {row.scans.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
