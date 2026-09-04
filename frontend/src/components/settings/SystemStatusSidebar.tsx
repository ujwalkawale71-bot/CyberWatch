import { ShieldAlert, CheckCircle, RefreshCw, Cpu, Database, Network, Globe } from 'lucide-react'

export default function SystemStatusSidebar() {
  const statusItems = [
    { name: 'Scan Engine', status: 'Operational', icon: Cpu, color: 'text-[#4FAF78]' },
    { name: 'Real-time', status: 'Active', icon: CheckCircle, color: 'text-[#4FAF78]' },
    { name: 'Threat Intel', status: 'Connected', icon: Network, color: 'text-[#4FAF78]' },
    { name: 'Database', status: 'Healthy', icon: Database, color: 'text-[#4FAF78]' },
    { name: 'API Services', status: 'Operational', icon: ShieldAlert, color: 'text-[#4FAF78]' },
    { name: 'Browser Extension', status: 'Connected', icon: Globe, color: 'text-[#4FAF78]' }
  ]

  return (
    <div className="bg-[#202428] rounded-xl border border-[#343A40] p-4 space-y-4 select-none text-left">
      <div className="flex items-center justify-between pb-2 border-b border-[#343A40]">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#747B82]">Platform Status</span>
          <h3 className="text-xs font-bold text-[#F1F3F4]">System Operational</h3>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="p-1.5 rounded-lg bg-[#171A1D] hover:bg-[#272C30] border border-[#343A40] text-[#A7ADB4] hover:text-[#F1F3F4] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {statusItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="flex items-center justify-between text-xs py-0.5 font-semibold">
              <div className="flex items-center space-x-2.5 text-[#A7ADB4]">
                <Icon className="w-4 h-4 text-[#747B82]" />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4FAF78] animate-pulse" />
                <span className={`text-[10px] font-bold uppercase tracking-wide ${item.color}`}>{item.status}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-[#343A40] text-[10px] text-[#747B82] leading-relaxed">
        <div className="flex justify-between font-semibold">
          <span>Uptime:</span>
          <span className="font-mono text-[#F1F3F4]">99.98% (Last 30d)</span>
        </div>
        <div className="flex justify-between font-semibold mt-1">
          <span>Last Sync:</span>
          <span className="font-mono text-[#F1F3F4]">1 min ago</span>
        </div>
      </div>
    </div>
  )
}
