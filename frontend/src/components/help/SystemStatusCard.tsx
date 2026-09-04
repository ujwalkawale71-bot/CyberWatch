import { Check } from 'lucide-react'

export default function SystemStatusCard() {
  const systems = [
    { name: 'Scanners', status: 'Active', color: 'bg-emerald-500' },
    { name: 'Alerts', status: 'Active', color: 'bg-emerald-500' },
    { name: 'API', status: 'Active', color: 'bg-emerald-500' },
    { name: 'Database', status: 'Active', color: 'bg-emerald-500' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white leading-none">System Status</h2>
        <span className="text-[10px] text-slate-500 mt-1 block">Live status checks of security clusters</span>
      </div>

      {/* Banner */}
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-405 rounded-lg flex items-center space-x-2 text-xs font-bold justify-center">
        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
          <Check className="w-4 h-4 flex-shrink-0" />
        </div>
        <div className="text-left">
          <span className="block font-bold text-[11px] uppercase tracking-wider leading-none">All Systems Operational</span>
          <span className="block text-[10px] text-slate-500 font-medium mt-1 leading-none">All services are running normally.</span>
        </div>
      </div>

      {/* Status dots row */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-850/50">
        {systems.map((sys) => (
          <div key={sys.name} className="p-2.5 rounded bg-slate-950/20 border border-slate-850 text-center space-y-1">
            <span className="text-[9px] font-bold text-slate-400 block leading-none">{sys.name}</span>
            <div className="flex items-center justify-center space-x-1.5 pt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sys.color}`} />
              <span className="text-[9px] font-extrabold text-slate-500 uppercase leading-none">{sys.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Uptime bar visual */}
      <div className="space-y-1.5 pt-4 border-t border-slate-850/50 text-xs">
        <div className="flex justify-between font-semibold items-baseline">
          <div className="space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Uptime</span>
            <div className="text-xl font-extrabold text-white tracking-tight font-mono leading-none">99.98%</div>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">30 Days Uptime</span>
        </div>
        <div className="flex space-x-0.5 pt-1.5">
          {Array.from({ length: 30 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-3.5 rounded-sm ${
                idx === 24 ? 'bg-amber-500' : 'bg-emerald-500' // mock one minor anomaly
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
