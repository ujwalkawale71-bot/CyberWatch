import { Database, Download, Upload, Trash2, FileText, Info, RefreshCw, Play } from 'lucide-react'
import type { SystemMaintenanceInfo } from '../../types/settings'

interface SystemMaintenanceSettingsProps {
  info: SystemMaintenanceInfo
  onAction: (name: string) => void
}

export default function SystemMaintenanceSettings({ info, onAction }: SystemMaintenanceSettingsProps) {
  const statusItems = [
    { label: 'Database Status', value: 'Healthy', color: 'text-[#4FAF78]' },
    { label: 'Database Version', value: info.dbVersion, color: 'text-[#F1F3F4] font-mono' },
    { label: 'Scan Engine Status', value: 'Operational', color: 'text-[#4FAF78]' },
    { label: 'Threat Intelligence', value: 'Connected', color: 'text-[#4FAF78]' },
    { label: 'API Services', value: 'Operational', color: 'text-[#4FAF78]' },
    { label: 'Browser Extension', value: 'Connected', color: 'text-[#4FAF78]' },
    { label: 'Last Database Update', value: info.lastBackup, color: 'text-[#F1F3F4] font-mono' },
    { label: 'System Uptime', value: '99.98% (Last 30d)', color: 'text-[#F1F3F4] font-mono' }
  ]

  return (
    <div className="space-y-6 text-left text-xs font-semibold">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">System Maintenance</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Inspect system status and run maintenance tasks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: System Status Details */}
        <div className="p-4 bg-[#171A1D]/25 border border-[#343A40] rounded-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-[#747B82] font-bold border-b border-[#343A40] pb-2 uppercase tracking-wider text-[10px]">
              <Info className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>System Status Metrics</span>
            </div>

            <div className="space-y-2.5">
              {statusItems.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between text-[11px] font-semibold border-b border-[#343A40]/40 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="text-[#A7ADB4]">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Maintenance Actions */}
        <div className="p-4 bg-[#171A1D]/25 border border-[#343A40] rounded-xl space-y-4">
          <div className="flex items-center space-x-1.5 text-[#747B82] font-bold border-b border-[#343A40] pb-2 uppercase tracking-wider text-[10px]">
            <Database className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span>Maintenance Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Backup Database */}
            <button
              onClick={() => onAction('Backup Database')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <Database className="w-3.5 h-3.5 text-[#2A9D8F] flex-shrink-0" />
              <span>Backup Database</span>
            </button>

            {/* Check for Updates */}
            <button
              onClick={() => onAction('Check for Updates')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2A9D8F] flex-shrink-0" />
              <span>Check for Updates</span>
            </button>

            {/* Restart Services */}
            <button
              onClick={() => onAction('Restart Services')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-[#4FAF78] flex-shrink-0" />
              <span>Restart Services</span>
            </button>

            {/* Clear Cache */}
            <button
              onClick={() => onAction('Clear Cache')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#D9534F] text-left transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Clear Cache</span>
            </button>

            {/* View System Logs */}
            <button
              onClick={() => onAction('View System Logs')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <FileText className="w-3.5 h-3.5 text-[#A7ADB4] flex-shrink-0" />
              <span>View Logs</span>
            </button>

            {/* Backup Configuration */}
            <button
              onClick={() => onAction('Backup Configuration')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <Download className="w-3.5 h-3.5 text-[#A7ADB4] flex-shrink-0" />
              <span>Backup Config</span>
            </button>

            {/* Export Config */}
            <button
              onClick={() => onAction('Export Configuration')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <Download className="w-3.5 h-3.5 text-[#747B82] flex-shrink-0" />
              <span>Export Config</span>
            </button>

            {/* Import Config */}
            <button
              onClick={() => onAction('Import Configuration')}
              className="py-2.5 px-3 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg text-[#F1F3F4] text-left transition-all flex items-center space-x-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#747B82] flex-shrink-0" />
              <span>Import Config</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
