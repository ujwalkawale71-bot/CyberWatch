import { useState, useEffect } from 'react'
import { ShieldAlert, Ban, ShieldX, HelpCircle, CheckCircle, FileWarning, ShieldCheck, AlertTriangle } from 'lucide-react'
import type { RiskSeverity } from '../../types/extensionScanner'

interface AIRecommendationProps {
  riskLevel?: RiskSeverity
  score?: number
}

export default function AIRecommendation({ riskLevel = 'SAFE', score = 0 }: AIRecommendationProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (actionName: string) => {
    setToastMsg(`Action "${actionName}" logged locally`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const isCritical = riskLevel === 'CRITICAL'
  const isHigh = riskLevel === 'HIGH'
  const isMed = riskLevel === 'MEDIUM'

  const borderCls = isCritical
    ? 'border-red-500/25 bg-red-500/5'
    : isHigh
    ? 'border-orange-500/25 bg-orange-500/5'
    : isMed
    ? 'border-amber-500/25 bg-amber-500/5'
    : 'border-emerald-500/25 bg-emerald-500/5'

  const textCls = isCritical
    ? 'text-red-400'
    : isHigh
    ? 'text-orange-400'
    : isMed
    ? 'text-amber-400'
    : 'text-emerald-400'

  const Icon = isCritical || isHigh ? ShieldAlert : isMed ? AlertTriangle : ShieldCheck

  return (
    <div className={`relative rounded-xl border ${borderCls} p-5 flex flex-col justify-between transition-colors text-left overflow-hidden min-h-[200px]`}>
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
          <div className={`flex items-center space-x-2 ${textCls}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-base font-extrabold tracking-tight uppercase leading-none">
              Recommendation Plan
            </h2>
          </div>

          <p className={`text-lg font-black ${textCls} tracking-tight leading-snug`}>
            {riskLevel === 'SAFE'
              ? 'Extension is evaluated as SAFE (Minimal Risk)'
              : `This extension is classified as ${riskLevel} RISK (Threat Score: ${score}/100)`}
          </p>

          <ul className="space-y-1.5 pt-1.5 text-xs text-slate-400 font-semibold list-disc pl-4">
            {isCritical && (
              <>
                <li>Requests dangerous permissions that allow universal website interception or native OS access.</li>
                <li>Presents severe exposure to authenticated sessions and private data.</li>
                <li>We recommend uninstalling or disabling this extension immediately.</li>
              </>
            )}
            {isHigh && (
              <>
                <li>Requests powerful permissions that allow network observation or broad host access.</li>
                <li>Could observe private browsing sessions or intercept sensitive web traffic if compromised.</li>
                <li>Restrict extension site access to &quot;On click&quot; or trusted domains only.</li>
              </>
            )}
            {isMed && (
              <>
                <li>Requests elevated permissions such as tabs, cookies, or downloads.</li>
                <li>Verify that you trust the extension publisher and developer before active use.</li>
                <li>Ensure permissions are consistent with the extension&apos;s advertised core utility.</li>
              </>
            )}
            {!isCritical && !isHigh && !isMed && (
              <>
                <li>Requests minimal or standard permissions necessary for benign browser operation.</li>
                <li>No broad network traffic interception or universal DOM modification detected.</li>
                <li>Safe for everyday browsing use. Maintain standard browser updates.</li>
              </>
            )}
          </ul>
        </div>

        {/* Action button panel */}
        <div className="w-full md:w-auto flex flex-col space-y-2.5 min-w-[200px]">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {isCritical || isHigh ? (
              <>
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
              </>
            ) : (
              <button
                onClick={() => handleAction('Approve for Enterprise')}
                className="flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve Extension</span>
              </button>
            )}
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
