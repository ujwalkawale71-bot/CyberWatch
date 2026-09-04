import { useEffect, useState } from 'react'
import { Image } from 'lucide-react'

export default function ScreenshotCard() {
  const [captureTime, setCaptureTime] = useState('')

  useEffect(() => {
    const now = new Date()
    setCaptureTime(now.toLocaleString())
  }, [])

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Screenshot</h2>
        <span className="text-xs text-slate-500 mt-1 block">Visual DOM viewport capture</span>
      </div>

      {/* Styled Placeholder Mock Box */}
      <div className="relative flex-1 my-3 bg-slate-950 border border-slate-850/80 rounded-lg overflow-hidden flex flex-col justify-between">
        {/* Fake Browser Content */}
        <div className="p-2 border-b border-slate-900 bg-slate-900/40 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </div>

        {/* Mock page template layout */}
        <div className="flex-1 p-4 flex flex-col justify-between space-y-2.5">
          {/* Header row */}
          <div className="flex justify-between items-center opacity-40">
            <div className="w-12 h-2.5 bg-blue-500/45 rounded-sm" />
            <div className="flex space-x-1.5">
              <span className="w-6 h-2 bg-slate-700 rounded-sm" />
              <span className="w-6 h-2 bg-slate-700 rounded-sm" />
              <span className="w-6 h-2 bg-slate-700 rounded-sm" />
            </div>
          </div>

          {/* Hero segment */}
          <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
            <Image className="w-7 h-7 text-slate-800" />
            <div className="w-24 h-2 bg-slate-700 rounded-sm opacity-60" />
            <div className="w-16 h-1.5 bg-slate-800 rounded-sm opacity-55" />
          </div>

          {/* Button row */}
          <div className="flex justify-center pt-1">
            <div className="w-14 h-4 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center">
              <span className="text-[6px] text-blue-500 font-bold">CLICK ME</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp label */}
      <span className="text-[10px] text-slate-500 font-semibold font-mono text-center">
        Captured on: {captureTime}
      </span>
    </div>
  )
}
