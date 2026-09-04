import { systemStatusData } from '../../data/overviewData'

export default function SystemStatus() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">System Status</h2>
        <span className="text-xs text-slate-500 mt-1 block">Platform module operation state</span>
      </div>

      {/* Services list */}
      <div className="flex-1 my-3 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col justify-center">
        {systemStatusData.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between text-xs py-1 border-b border-slate-850 last:border-0 last:pb-0"
          >
            <span className="text-slate-400 font-medium">{service.name}</span>
            <div className="flex items-center space-x-2">
              <span className={`w-1.5 h-1.5 rounded-full ${
                service.type === 'green'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-650'
              }`} />
              <span className={`font-bold ${
                service.type === 'green' ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder height alignment wrapper */}
      <div className="h-2" />
    </div>
  )
}
