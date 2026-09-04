import { Globe } from 'lucide-react'

export default function ThreatMap() {
  // Mock coordinate nodes for glowing threat markers
  const markers = [
    { x: '25%', y: '35%', pulseDelay: '0s', label: 'US-EAST: Brute Force' },
    { x: '52%', y: '32%', pulseDelay: '0.4s', label: 'EU-WEST: C2 Server' },
    { x: '78%', y: '42%', pulseDelay: '0.8s', label: 'AS-EAST: Phishing Campaign' },
    { x: '38%', y: '68%', pulseDelay: '1.2s', label: 'SA-EAST: Botnet node' },
    { x: '86%', y: '74%', pulseDelay: '0.2s', label: 'AU-EAST: Scanner activity' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Threat Map (Global)</h2>
        <span className="text-xs text-slate-500 mt-1 block">Live global threat interception activity</span>
      </div>

      {/* Map Canvas with Dotted Background */}
      <div className="relative flex-1 my-3 bg-slate-950/50 rounded-lg border border-slate-800/80 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] flex items-center justify-center">
        {/* World Map SVG Outline overlay (Simplified abstract vector representation) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 text-slate-500 pointer-events-none"
          viewBox="0 0 800 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {/* Abstract landmass representation using lines/grids */}
          <path d="M 150 120 Q 200 130 250 120 T 320 180 T 350 220 Q 300 240 240 230 Z" />
          <path d="M 420 100 Q 480 90 540 110 T 600 150 T 680 120 Q 720 140 700 180 T 630 240 Z" />
          <path d="M 280 260 Q 300 280 290 320 Q 250 340 220 300 Z" />
          <path d="M 450 200 Q 500 220 480 270 Q 440 280 430 240 Z" />
          <path d="M 640 270 Q 680 280 670 320 Q 620 310 630 280 Z" />
          {/* Cyber network grids */}
          <line x1="25%" y1="35%" x2="52%" y2="32%" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.5" />
          <line x1="52%" y1="32%" x2="78%" y2="42%" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.5" />
          <line x1="38%" y1="68%" x2="25%" y2="35%" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.5" />
          <line x1="52%" y1="32%" x2="38%" y2="68%" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.5" />
        </svg>

        {/* Floating Globe watermark in center */}
        <Globe className="w-20 h-20 text-slate-800/20 animate-[spin_60s_linear_infinite]" />

        {/* Pulsing Red Threat Markers */}
        {markers.map((marker, i) => (
          <div
            key={i}
            className="absolute group cursor-pointer"
            style={{ left: marker.x, top: marker.y }}
          >
            {/* Pulsing glow ring */}
            <span
              className="absolute -left-2 -top-2 w-5 h-5 rounded-full bg-red-500/40 animate-ping"
              style={{ animationDelay: marker.pulseDelay, animationDuration: '2s' }}
            />
            {/* Core dot */}
            <span className="relative block w-1.5 h-1.5 rounded-full bg-red-500 border border-red-300" />

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 text-[10px] text-red-400 font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-10">
              {marker.label}
            </div>
          </div>
        ))}

        {/* Bottom Right Density Scale */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-slate-900/90 border border-slate-800/80 px-2 py-1 rounded-md text-[9px] text-slate-400 font-medium">
          <span>Low</span>
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-500" />
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
