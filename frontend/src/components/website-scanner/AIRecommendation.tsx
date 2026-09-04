import { useState, useEffect } from 'react'
import { ShieldAlert, Ban, AlertOctagon, HelpCircle, CheckCircle, FileWarning, AlertCircle } from 'lucide-react'

interface AIRecommendationProps {
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  score?: number
}

export default function AIRecommendation({ riskLevel = 'SAFE', score = 0 }: AIRecommendationProps) {
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

  const isDangerous = riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
  const isMedium = riskLevel === 'MEDIUM'

  const containerClass = isDangerous
    ? "relative rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex flex-col justify-between hover:border-red-500/30 transition-colors text-left overflow-hidden min-h-[220px]"
    : isMedium
      ? "relative rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-col justify-between hover:border-amber-500/30 transition-colors text-left overflow-hidden min-h-[220px]"
      : "relative rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors text-left overflow-hidden min-h-[220px]"

  const titleClass = isDangerous
    ? "flex items-center space-x-2 text-red-500"
    : isMedium
      ? "flex items-center space-x-2 text-amber-500"
      : "flex items-center space-x-2 text-[#4FAF78]"

  const titleText = isDangerous
    ? "CRITICAL Threat Advice"
    : isMedium
      ? "Suspicious Alert Advice"
      : "Safe Assessment Advice"

  const statusText = `This Website is classified as ${riskLevel} RISK (Threat Score: ${score}).`

  const Icon = isDangerous ? ShieldAlert : isMedium ? AlertCircle : CheckCircle

  return (
    <div className={containerClass}>
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-[#202428] border border-[#343A40] px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Main recommendation copy */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        {/* Advice panel */}
        <div className="space-y-3 flex-1">
          <div className={titleClass}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-base font-extrabold tracking-tight uppercase leading-none">
              {titleText}
            </h2>
          </div>
          <p className={`text-lg font-black tracking-tight leading-snug ${isDangerous ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-emerald-450'}`}>
            {statusText}
          </p>

          <ul className="space-y-1.5 pt-1.5 text-xs text-slate-400 font-semibold list-disc pl-4">
            {isDangerous ? (
              <>
                <li>This website exhibits high severity security vulnerabilities.</li>
                <li>It may attempt to capture credentials or execute cross-domain redirects.</li>
                <li>Avoid submitting any personal logins or payment details.</li>
              </>
            ) : isMedium ? (
              <>
                <li>Some missing security configurations (e.g. CSP, HSTS) were detected.</li>
                <li>Proceed with caution when transmitting active scripts or credentials.</li>
                <li>Check the details for mixed passive elements.</li>
              </>
            ) : (
              <>
                <li>This site aligns with secure connection configurations.</li>
                <li>Transport protocol uses valid SSL encryption rules.</li>
                <li>No suspicious cross-domain redirects or traversal indicators were matched.</li>
              </>
            )}
          </ul>
        </div>

        {/* Buttons layout */}
        <div className="w-full md:w-auto flex flex-col space-y-2.5 min-w-[200px]">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <button
              onClick={() => handleAction('Block Website')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg transition-colors active:scale-[0.98]"
            >
              <Ban className="w-4 h-4" />
              <span>Block Website</span>
            </button>

            <button
              onClick={() => handleAction('Warn User')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-orange-650 hover:bg-orange-700 rounded-lg transition-colors active:scale-[0.98]"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Warn User</span>
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
              onClick={() => handleAction('Report Website')}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors active:scale-[0.98]"
            >
              <FileWarning className="w-4 h-4" />
              <span>Report Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
