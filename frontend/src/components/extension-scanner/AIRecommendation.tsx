import { useState, useEffect } from 'react'
import { ShieldAlert, Ban, ShieldX, HelpCircle, CheckCircle, FileWarning } from 'lucide-react'

export default function AIRecommendation() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (actionName: string) => {
    setToastMsg(`Action "${actionName}" logged locally (backend not connected)`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  return (
    <div className="relative rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex flex-col justify-between hover:border-red-500/30 transition-colors text-left overflow-hidden min-h-[220px]">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Advice Info block */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-red-500">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-base font-extrabold tracking-tight uppercase leading-none">
              AI Recommendation
            </h2>
          </div>
          <p className="text-lg font-black text-red-400 tracking-tight leading-snug">
            This extension is classified as CRITICAL RISK.
          </p>

          <ul className="space-y-1.5 pt-1.5 text-xs text-slate-400 font-semibold list-disc pl-4">
            <li>Requests permission to access and modify data on all websites you visit.</li>
            <li>Contains code patterns associated with data exfiltration.</li>
            <li>We strongly recommend removing this extension immediately.</li>
          </ul>
        </div>

        {/* Remediate Button panel */}
        <div className="w-full md:w-auto flex flex-col space-y-2.5 min-w-[200px]">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <button
              onClick={() => handleAction('Block Extension')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg transition-colors active:scale-[0.98]"
            >
              <Ban className="w-4 h-4" />
              <span>Block Extension</span>
            </button>

            <button
              onClick={() => handleAction('Quarantine')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-orange-650 hover:bg-orange-700 rounded-lg transition-colors active:scale-[0.98]"
            >
              <ShieldX className="w-4 h-4" />
              <span>Quarantine</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <button
              onClick={() => handleAction('Open in Sandbox')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-650 hover:bg-blue-700 rounded-lg transition-colors active:scale-[0.98]"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Open in Sandbox</span>
            </button>

            <button
              onClick={() => handleAction('Report Extension')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors active:scale-[0.98]"
            >
              <FileWarning className="w-4 h-4" />
              <span>Report Extension</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
