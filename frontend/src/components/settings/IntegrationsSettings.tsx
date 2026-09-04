import { Shield, Globe, Database, Radio, Network, FileCheck } from 'lucide-react'
import type { IntegrationItem } from '../../types/settings'

const iconMap = {
  Shield,
  Globe,
  Database,
  Radio,
  Network,
  FileCheck
}

interface IntegrationsSettingsProps {
  integrations: IntegrationItem[]
  onConfigure: (name: string) => void
  onTestConnection: (name: string) => void
}

export default function IntegrationsSettings({
  integrations,
  onConfigure,
  onTestConnection
}: IntegrationsSettingsProps) {
  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">Integrations Settings</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Connect external security operations platforms</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = iconMap[item.iconName as keyof typeof iconMap] || Shield
          const isConnected = item.status === 'Configured'

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#343A40] bg-[#171A1D]/25 p-4 flex flex-col justify-between hover:border-[#272C30] transition-all h-[180px] text-xs font-semibold"
            >
              {/* Top Row: Icon, Info, Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 rounded bg-[#171A1D] border border-[#3A4147] text-[#2A9D8F] flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-bold text-[#F1F3F4] block leading-none mb-1.5 truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#A7ADB4] leading-none block font-medium truncate">
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <span
                  className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none flex-shrink-0 ${
                    isConnected
                      ? 'bg-[#4FAF78]/10 text-[#4FAF78] border-[#4FAF78]/20'
                      : 'bg-[#747B82]/10 text-[#747B82] border-[#343A40]'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              {/* Sync details */}
              <div className="text-[10px] text-[#747B82] flex justify-between font-semibold">
                <span>Last Synchronized:</span>
                <span className="font-mono text-[#A7ADB4]">{item.lastSync}</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#343A40]/40">
                <button
                  type="button"
                  onClick={() => onConfigure(item.name)}
                  className="flex-1 py-2 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] text-[10px] font-bold text-[#A7ADB4] hover:text-[#F1F3F4] rounded-lg transition-colors cursor-pointer"
                >
                  Configure
                </button>
                <button
                  type="button"
                  onClick={() => onTestConnection(item.name)}
                  className="flex-1 py-2 bg-[#2A9D8F] hover:bg-[#238276] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Test Connection
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
