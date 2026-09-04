import { Globe } from 'lucide-react'

export default function LiveThreatMap() {
  const markers = [
    { x: '18%', y: '30%', delay: '0.1s', name: 'US-WEST' },
    { x: '28%', y: '38%', delay: '0.6s', name: 'US-EAST' },
    { x: '46%', y: '28%', delay: '1.2s', name: 'EU-NORTH' },
    { x: '53%', y: '35%', delay: '0.3s', name: 'EU-EAST' },
    { x: '72%', y: '32%', delay: '0.9s', name: 'AS-NORTH' },
    { x: '82%', y: '44%', delay: '1.5s', name: 'AS-EAST' },
    { x: '35%', y: '72%', delay: '0.7s', name: 'SA-WEST' },
    { x: '58%', y: '62%', delay: '0.4s', name: 'AFRICA' },
    { x: '84%', y: '76%', delay: '1.1s', name: 'OCEANIA' }
  ]

  const stats = [
    { label: 'Live Attacks', value: '12,487', color: 'text-red-500' },
    { label: 'Active Botnets', value: '342', color: 'text-orange-500' },
    { label: 'Targeted Countries', value: '74', color: 'text-blue-400' },
    { label: 'Avg Threat/Min', value: '8,329', color: 'text-purple-400' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col h-[400px] hover:border-slate-700 transition-colors text-left overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <h2 className="text-base font-bold text-white leading-none">Live Threat Map (Global)</h2>
        <span className="text-xs text-slate-500 mt-1 block">Real-time global intercept vectors</span>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 bg-slate-950/40 border-y border-slate-850/60 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] flex items-center justify-center">
        {/* World Map SVG Outline */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 text-slate-500 pointer-events-none"
          viewBox="0 0 800 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {/* Continents */}
          <path d="M 120 100 Q 180 110 220 90 T 300 160 T 330 200 Q 280 220 220 210 Z" />
          <path d="M 400 80 Q 460 70 520 90 T 580 130 T 660 100 Q 700 120 680 160 T 610 220 Z" />
          <path d="M 250 240 Q 270 260 260 300 Q 220 320 190 280 Z" />
          <path d="M 420 180 Q 470 200 450 250 Q 410 260 400 220 Z" />
          <path d="M 620 250 Q 660 260 650 300 Q 600 290 610 260 Z" />

          {/* Dash connection paths between threat zones */}
          <path
            d="M 224 152 L 424 140"
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth="0.8"
            className="animate-[dash_10s_linear_infinite] opacity-60"
          />
          <path
            d="M 424 140 L 656 176"
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth="0.8"
            className="animate-[dash_10s_linear_infinite] opacity-60"
          />
          <path
            d="M 656 176 L 224 152"
            stroke="#a855f7"
            strokeDasharray="4 4"
            strokeWidth="0.8"
            className="animate-[dash_10s_linear_infinite] opacity-65"
          />
        </svg>

        {/* Floating Rotating Globe Watermark */}
        <Globe className="w-24 h-24 text-slate-800/15 animate-[spin_80s_linear_infinite]" />

        {/* Threat Markers */}
        {markers.map((marker, i) => (
          <div
            key={i}
            className="absolute group cursor-pointer"
            style={{ left: marker.x, top: marker.y }}
          >
            <span
              className="absolute -left-2 -top-2 w-5 h-5 rounded-full bg-red-500/30 animate-ping"
              style={{ animationDelay: marker.delay, animationDuration: '2.5s' }}
            />
            <span className="relative block w-1.5 h-1.5 rounded-full bg-red-500 border border-red-300" />
            <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 text-[9px] text-red-400 font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-10">
              {marker.name}: INCOMING IOC MATCH
            </div>
          </div>
        ))}

        {/* Low to Critical legend */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-slate-900/90 border border-slate-800/80 px-2 py-1 rounded-md text-[9px] text-slate-400 font-medium">
          <span>Low</span>
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-500" />
          <span>Critical</span>
        </div>
      </div>

      {/* Bottom stats row inside the card */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950/20">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider truncate max-w-full">
              {stat.label}
            </span>
            <span className={`text-sm font-extrabold font-mono tracking-tight tabular-nums mt-0.5 leading-none ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
