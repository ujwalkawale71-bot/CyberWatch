import { useState } from 'react'
import { ShieldCheck, Check } from 'lucide-react'

interface RealtimeProtectionSettingsProps {
  onSave: () => void
}

export default function RealtimeProtectionSettings({ onSave }: RealtimeProtectionSettingsProps) {
  const [realtime, setRealtime] = useState(true)
  const [urlProtection, setUrlProtection] = useState(true)
  const [webProtection, setWebProtection] = useState(true)
  const [extensionProtection, setExtensionProtection] = useState(true)
  const [downloadProtection, setDownloadProtection] = useState(true)
  const [behaviorProtection, setBehaviorProtection] = useState(true)
  const [phishingProtection, setPhishingProtection] = useState(true)
  const [domainProtection, setDomainProtection] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  const handleReset = () => {
    setRealtime(true)
    setUrlProtection(true)
    setWebProtection(true)
    setExtensionProtection(true)
    setDownloadProtection(true)
    setBehaviorProtection(true)
    setPhishingProtection(true)
    setDomainProtection(true)
  }

  const protectionToggles = [
    { id: 'rt', label: 'Real-time Protection', desc: 'Core daemon scanning browser processes in the background.', state: realtime, setter: setRealtime },
    { id: 'url', label: 'URL Protection', desc: 'Scan link URLs reputation before requests leave the client.', state: urlProtection, setter: setUrlProtection },
    { id: 'web', label: 'Website Protection', desc: 'Audit structural vulnerabilities and technology profiles of loaded pages.', state: webProtection, setter: setWebProtection },
    { id: 'ext', label: 'Extension Protection', desc: 'Audit installed extension manifests and scripts updates.', state: extensionProtection, setter: setExtensionProtection },
    { id: 'dl', label: 'Download Protection', desc: 'Scan downloaded binary archives files for signatures.', state: downloadProtection, setter: setDownloadProtection },
    { id: 'beh', label: 'Behavior Protection', desc: 'Trace script injections, DLL hooks, and command-line threads.', state: behaviorProtection, setter: setBehaviorProtection },
    { id: 'phish', label: 'Phishing Protection', desc: 'Evaluate page similarity metrics against credential harvest pages.', state: phishingProtection, setter: setPhishingProtection },
    { id: 'dom', label: 'Malicious Domain Protection', desc: 'Block known malware hosting domains and bad nameservers.', state: domainProtection, setter: setDomainProtection }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Header with Protection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343A40] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#F1F3F4]">Real-time Protection Settings</h2>
          <span className="text-xs text-[#747B82] mt-1 block">Configure live interception engines and shields</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#4FAF78]/10 border border-[#4FAF78]/15 text-[#4FAF78] text-[10px] font-extrabold uppercase rounded-lg tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protection Status: ACTIVE</span>
        </div>
      </div>

      {/* Toggles Panel */}
      <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4 text-xs font-semibold">
        <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Security Protection Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {protectionToggles.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-[#343A40]/40 bg-[#171A1D]/15 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#F1F3F4] block leading-none">{item.label}</span>
                  <span
                    className={`text-[8px] font-extrabold px-1 rounded-sm leading-none ${
                      item.state
                        ? 'bg-[#4FAF78]/10 text-[#4FAF78] border border-[#4FAF78]/15'
                        : 'bg-[#747B82]/10 text-[#747B82] border border-[#747B82]/15'
                    }`}
                  >
                    {item.state ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[10px] text-[#747B82] font-semibold leading-normal mt-1.5">
                  {item.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => item.setter(!item.state)}
                className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer mt-0.5 ${
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
