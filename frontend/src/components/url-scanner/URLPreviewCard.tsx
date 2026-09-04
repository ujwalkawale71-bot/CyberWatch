import { Lock, Globe } from 'lucide-react'
import type { URLPreviewDetails } from '../../types/urlScanner'

interface URLPreviewCardProps {
  url: string
  details: URLPreviewDetails
}

export default function URLPreviewCard({ url, details }: URLPreviewCardProps) {
  // Extract simple hostname for fake browser search bar
  let hostname = 'secure-verify-account.com/login'
  try {
    const urlObj = new URL(url)
    hostname = urlObj.hostname + urlObj.pathname
  } catch (e) {
    if (url) hostname = url
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left">
      <div>
        <h2 className="text-base font-bold text-white leading-none">URL Preview</h2>
        <span className="text-xs text-slate-500 mt-1 block">Visual DOM layout analysis</span>
      </div>

      {/* Styled Browser-Chrome Mock Box */}
      <div className="my-4 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[220px]">
        {/* Browser Top Bar */}
        <div className="bg-slate-900 px-3 py-2 flex items-center space-x-2 border-b border-slate-850">
          {/* 3 dots */}
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Fake Address Bar */}
          <div className="flex-1 bg-slate-950/60 border border-slate-850 rounded py-0.5 px-3 mx-4 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 font-mono select-none truncate">
              {hostname}
            </span>
          </div>
        </div>

        {/* Browser View Body */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center">
          {/* Fake Login Card */}
          <div className="w-full max-w-[200px] bg-slate-900 border border-slate-800 p-4 rounded-lg shadow flex flex-col items-center space-y-2">
            <div className="p-1 rounded bg-slate-950 text-slate-650">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-white tracking-wide">{details.title}</span>

            {/* Mock Inputs */}
            <div className="w-full space-y-1.5 pt-1">
              <div className="w-full h-5 bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-[8px] text-slate-600 font-medium select-none">
                Email address
              </div>
              <div className="w-full h-5 bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-[8px] text-slate-600 font-medium select-none flex items-center justify-between">
                <span>••••••••</span>
              </div>
            </div>

            {/* Mock Button */}
            <button
              type="button"
              disabled
              className="w-full py-1 text-[8px] font-extrabold text-white bg-blue-500/40 rounded opacity-60 cursor-not-allowed select-none"
            >
              Log In
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Key Value List */}
      <div className="space-y-2 text-xs border-t border-slate-800/45 pt-4">
        <div className="flex justify-between border-b border-slate-850/50 pb-1.5 last:border-0 last:pb-0">
          <span className="text-slate-450 font-medium">Page Title:</span>
          <span className="text-slate-200 font-bold max-w-[200px] truncate">{details.title}</span>
        </div>
        <div className="flex justify-between border-b border-slate-850/50 pb-1.5 last:border-0 last:pb-0">
          <span className="text-slate-450 font-medium">Description:</span>
          <span className="text-slate-350 font-medium max-w-[200px] truncate">
            {details.description}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-850/50 pb-1.5 last:border-0 last:pb-0">
          <span className="text-slate-450 font-medium">IP Address:</span>
          <span className="text-slate-200 font-mono leading-none">{details.ipAddress}</span>
        </div>
        <div className="flex justify-between border-b border-slate-850/50 pb-1.5 last:border-0 last:pb-0">
          <span className="text-slate-450 font-medium">Hosting Provider:</span>
          <span className="text-slate-300 font-semibold truncate max-w-[200px]">
            {details.hostingProvider}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450 font-medium">Country Location:</span>
          <span className="text-slate-250 font-bold flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-blue-500/80 mr-1" />
            {details.country}
          </span>
        </div>
      </div>
    </div>
  )
}
