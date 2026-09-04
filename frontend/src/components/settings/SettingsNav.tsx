import { Settings, Shield, Zap, Bell, Cpu, Users, Wrench, Lock, Eye, Sliders } from 'lucide-react'
import type { SettingsSection } from '../../types/settings'

interface SettingsNavProps {
  activeSection: SettingsSection
  onChange: (section: SettingsSection) => void
}

const navItems: { id: SettingsSection; label: string; desc: string; icon: any }[] = [
  { id: 'general', label: 'General', desc: 'Organization profile & default metrics', icon: Settings },
  { id: 'scan-engine', label: 'Scan Engine', desc: 'Threat scoring & depth configurations', icon: Shield },
  { id: 'realtime', label: 'Real-time Protection', desc: 'Active security & background monitors', icon: Zap },
  { id: 'notifications', label: 'Notifications', desc: 'Alert channels & severity filters config', icon: Bell },
  { id: 'integrations', label: 'Integrations', desc: 'VirusTotal, URLhaus & API connectors', icon: Cpu },
  { id: 'user-mgmt', label: 'User Management', desc: 'Access controls, roles & permissions', icon: Users },
  { id: 'maintenance', label: 'System Maintenance', desc: 'System commands, logs & backups', icon: Wrench },
  { id: 'privacy', label: 'Data & Privacy', desc: 'Retention windows & privacy zone', icon: Lock },
  { id: 'appearance', label: 'Appearance', desc: 'Theme selectors & live visual preview', icon: Eye },
  { id: 'advanced', label: 'Advanced', desc: 'Rate limits, webhook triggers & APIs', icon: Sliders }
]

export default function SettingsNav({ activeSection, onChange }: SettingsNavProps) {
  return (
    <div className="flex flex-col w-full bg-[#202428] rounded-xl border border-[#343A40] p-3 space-y-1.5 select-none text-left">
      <div className="px-3 py-2 border-b border-[#343A40] mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#747B82]">Settings Navigation</span>
      </div>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full flex items-start space-x-3 py-2.5 px-3.5 rounded-lg text-left transition-all border-l-2 ${
                isActive
                  ? 'bg-blue-505/10 bg-[#2A9D8F]/10 border-l-[#2A9D8F] text-[#F1F3F4]'
                  : 'border-l-transparent hover:bg-[#272C30] text-[#A7ADB4] hover:text-[#F1F3F4]'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-[#2A9D8F]' : 'text-[#747B82]'}`} />
              <div className="min-w-0">
                <span className="block text-xs font-bold leading-none">{item.label}</span>
                <span className="block text-[9.5px] text-[#747B82] font-semibold mt-1 truncate leading-tight">
                  {item.desc}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
