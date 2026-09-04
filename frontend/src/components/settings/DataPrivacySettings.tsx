import { useState } from 'react'
import { AlertOctagon, Check, ShieldAlert } from 'lucide-react'

interface DataPrivacySettingsProps {
  onSave: () => void
  onDeleteData: () => void
  onAction: (msg: string) => void
}

export default function DataPrivacySettings({ onSave, onDeleteData, onAction }: DataPrivacySettingsProps) {
  const [dataRetention, setDataRetention] = useState('90 Days')
  const [scanRetention, setScanRetention] = useState('180 Days')
  const [intelRetention, setIntelRetention] = useState('365 Days')

  const [anonSharing, setAnonSharing] = useState(false)
  const [ipAnon, setIpAnon] = useState(true)
  const [sensitiveMasking, setSensitiveMasking] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  const handleReset = () => {
    setDataRetention('90 Days')
    setScanRetention('180 Days')
    setIntelRetention('365 Days')
    setAnonSharing(false)
    setIpAnon(true)
    setSensitiveMasking(true)
  }

  const handleDangerAction = (action: string) => {
    const ok = window.confirm(`Are you absolutely sure you want to perform: "${action}"? This action is irreversible.`)
    if (ok) {
      if (action === 'Delete All Data') {
        onDeleteData()
      } else {
        onAction(`Danger operation: "${action}" executed successfully`)
      }
    }
  }

  const toggles = [
    { id: 'anon', label: 'Anonymous Data Sharing', desc: 'Share telemetry logs anonymously to aid in machine learning scoring.', state: anonSharing, setter: setAnonSharing },
    { id: 'ip', label: 'IP Address Anonymization', desc: 'Scrub internal subnet client IPs from public lookup headers.', state: ipAnon, setter: setIpAnon },
    { id: 'mask', label: 'Sensitive Data Masking', desc: 'Mask authorization headers, session cookies, and login parameters from database records.', state: sensitiveMasking, setter: setSensitiveMasking }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left text-xs font-semibold">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">Data &amp; Privacy</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Configure telemetry retention times and privacy parameters</span>
      </div>

      <div className="space-y-5">
        {/* Card 1: Data Retention Periods */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Retention Windows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Data Retention */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Data Retention Period</label>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="w-full py-2 px-2 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="30 Days">30 Days</option>
                <option value="90 Days">90 Days</option>
                <option value="365 Days">365 Days</option>
              </select>
            </div>

            {/* Scan History Retention */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Scan History Retention</label>
              <select
                value={scanRetention}
                onChange={(e) => setScanRetention(e.target.value)}
                className="w-full py-2 px-2 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="90 Days">90 Days</option>
                <option value="180 Days">180 Days</option>
                <option value="365 Days">365 Days</option>
              </select>
            </div>

            {/* Threat Intelligence Retention */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Threat Intel Retention</label>
              <select
                value={intelRetention}
                onChange={(e) => setIntelRetention(e.target.value)}
                className="w-full py-2 px-2 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="180 Days">180 Days</option>
                <option value="365 Days">365 Days</option>
                <option value="Forever">Forever</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Privacy Toggles */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Privacy Policies</h3>
          <div className="space-y-3.5 divide-y divide-[#343A40]/40">
            {toggles.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 pt-3.5 first:pt-0">
                <div className="space-y-1">
                  <span className="font-bold text-[#F1F3F4] block leading-none">{item.label}</span>
                  <p className="text-[10.5px] text-[#747B82] font-semibold leading-normal max-w-[450px]">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => item.setter(!item.state)}
                  className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                    item.state ? 'bg-[#2A9D8F]' : 'bg-[#343A40]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all flex items-center justify-center ${
                      item.state ? 'right-0.5' : 'left-0.5'
                    }`}
                  >
                    {item.state && <Check className="w-2.5 h-2.5 text-[#2A9D8F]" />}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Danger Zone */}
        <div className="p-4 rounded-xl border border-[#D9534F]/20 bg-[#D9534F]/5 space-y-4">
          <div className="flex items-center space-x-1.5 text-[#D9534F]">
            <AlertOctagon className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="text-[10px] text-[#A7ADB4] leading-normal">
            Destructive tasks that override system parameters or clean localized operations databases. Perform with caution.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1.5">
            {/* Delete Scan History */}
            <button
              type="button"
              onClick={() => handleDangerAction('Delete Scan History')}
              className="py-2 px-4 rounded bg-[#D9534F]/10 hover:bg-[#D9534F] border border-[#D9534F]/20 text-[#D9534F] hover:text-white font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
              <span>Delete Scan History</span>
            </button>

            {/* Reset Configuration */}
            <button
              type="button"
              onClick={() => handleDangerAction('Reset Configuration')}
              className="py-2 px-4 rounded bg-[#D9534F]/10 hover:bg-[#D9534F] border border-[#D9534F]/20 text-[#D9534F] hover:text-white font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset Configuration</span>
            </button>

            {/* Delete All Data */}
            <button
              type="button"
              onClick={() => handleDangerAction('Delete All Data')}
              className="py-2 px-4 rounded bg-[#D9534F]/10 hover:bg-[#D9534F] border border-[#D9534F]/20 text-[#D9534F] hover:text-white font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#343A40] flex space-x-3 text-xs">
        <button
          type="submit"
          className="py-2.5 px-6 font-bold text-white bg-[#2A9D8F] hover:bg-[#238276] rounded-lg transition-all shadow-sm active:scale-[0.98]"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="py-2.5 px-6 font-bold text-[#A7ADB4] bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg transition-all active:scale-[0.98]"
        >
          Reset Defaults
        </button>
      </div>
    </form>
  )
}

function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
