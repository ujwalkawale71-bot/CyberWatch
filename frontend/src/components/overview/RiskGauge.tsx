export default function RiskGauge() {
  const score = 71
  const maxScore = 100
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / maxScore) * circumference

  const ranges = [
    { label: 'Critical (81-100)', count: 96, color: 'bg-red-500' },
    { label: 'High (61-80)', count: 612, color: 'bg-orange-500' },
    { label: 'Medium (41-60)', count: 548, color: 'bg-amber-500' },
    { label: 'Low (21-40)', count: 298, color: 'bg-blue-500' },
    { label: 'Safe (0-20)', count: 63, color: 'bg-emerald-500' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">AI Risk Score Overview</h2>
        <span className="text-xs text-slate-500 mt-1 block">Network threat severity distribution</span>
      </div>

      {/* Main Panel Content split */}
      <div className="flex-1 flex items-center justify-between gap-4 min-h-0 mt-2">
        {/* Left Side: Circular SVG Gauge Dial */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" /> {/* blue */}
                  <stop offset="60%" stopColor="#f97316" /> {/* orange */}
                  <stop offset="100%" stopColor="#ef4444" /> {/* red */}
                </linearGradient>
              </defs>
              {/* Outer background track */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="7.5"
                fill="transparent"
              />
              {/* Progressive filled indicator */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="url(#gaugeGradient)"
                strokeWidth="7.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner score label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {score}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1">/{maxScore}</span>
            </div>
          </div>

          {/* Severity Badge */}
          <span className="mt-2 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border leading-none bg-orange-500/10 text-orange-500 border-orange-500/20">
            HIGH RISK
          </span>
        </div>

        {/* Right Side: Ranges Breakdown list */}
        <div className="flex-1 space-y-1.5 text-xs">
          {ranges.map((range) => (
            <div key={range.label} className="flex items-center justify-between border-b border-slate-800/20 pb-1 last:border-0 last:pb-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${range.color}`} />
                <span className="text-slate-400 font-medium text-[11px] truncate">{range.label}</span>
              </div>
              <span className="text-slate-200 font-bold font-mono text-[11px] tabular-nums">{range.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
