import { useState } from 'react'
import { ShieldCheck, Check } from 'lucide-react'

interface ScanEngineSettingsProps {
  onSave: () => void
}

export default function ScanEngineSettings({ onSave }: ScanEngineSettingsProps) {
  const [aiScoring, setAiScoring] = useState(true)
  const [deepScan, setDeepScan] = useState(true)
  const [heuristic, setHeuristic] = useState(true)
  const [intelLookup, setIntelLookup] = useState(true)
  const [reputationCheck, setReputationCheck] = useState(true)
  const [sandboxAnalysis, setSandboxAnalysis] = useState(true)
  const [timeout, setTimeoutVal] = useState(120)
  const [maxFileSize, setMaxFileSize] = useState(100)
  const [scanDepth, setScanDepth] = useState('Deep')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  const handleReset = () => {
    setAiScoring(true)
    setDeepScan(true)
    setHeuristic(true)
    setIntelLookup(true)
    setReputationCheck(true)
    setSandboxAnalysis(true)
    setTimeoutVal(120)
    setMaxFileSize(100)
    setScanDepth('Deep')
  }

  const toggles = [
    { id: 'ai', label: 'AI Threat Scoring', desc: 'Use machine learning classifiers to predict threat vectors.', state: aiScoring, setter: setAiScoring },
    { id: 'deep', label: 'Deep Scan Options', desc: 'Perform raw script unpacks and recursive payload checks.', state: deepScan, setter: setDeepScan },
    { id: 'heuristic', label: 'Heuristic Analysis', desc: 'Audit extensions and websites against behavioral signatures.', state: heuristic, setter: setHeuristic },
    { id: 'intel', label: 'Threat Intelligence Lookup', desc: 'Correlate malicious markers with global blacklists (URLhaus, AbuseIPDB).', state: intelLookup, setter: setIntelLookup },
    { id: 'reputation', label: 'Reputation Check', desc: 'Check domain registration metrics and SSL validity parameters.', state: reputationCheck, setter: setReputationCheck },
    { id: 'sandbox', label: 'Sandbox Analysis', desc: 'Evaluate runtime behavior signatures in dynamic isolated containers.', state: sandboxAnalysis, setter: setSandboxAnalysis }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Header with Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343A40] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#F1F3F4]">Scan Engine Settings</h2>
          <span className="text-xs text-[#747B82] mt-1 block">Configure telemetry scanning levels and heuristics thresholds</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#4FAF78]/10 border border-[#4FAF78]/15 text-[#4FAF78] text-[10px] font-extrabold uppercase rounded-lg tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Engine Status: Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold">
        {/* Left column (2/3): Toggles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Analysis Heuristics</h3>
            <div className="divide-y divide-[#343A40]/40 space-y-3.5">
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
        </div>

        {/* Right column (1/3): Numeric & Dropdowns */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4 h-full">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Scanner Thresholds</h3>

            {/* Maximum Scan Timeout */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Maximum Scan Timeout (sec)</label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutVal(Number(e.target.value))}
                className="w-full py-2 px-3 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-mono"
              />
            </div>

            {/* Maximum File Size */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Maximum File Size (MB)</label>
              <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(Number(e.target.value))}
                className="w-full py-2 px-3 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-mono"
              />
            </div>

            {/* Scan Depth */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Scan Depth Complexity</label>
              <select
                value={scanDepth}
                onChange={(e) => setScanDepth(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="Standard">Standard (Quick Signature Audit)</option>
                <option value="Deep">Deep (Obfuscation check & decompilation)</option>
                <option value="Paranoid">Paranoid (Full sandbox script tracing)</option>
              </select>
            </div>
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
