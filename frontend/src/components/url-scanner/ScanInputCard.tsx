import { useState } from 'react'
import { ArrowRight, Link as LinkIcon } from 'lucide-react'

interface ScanInputCardProps {
  onScan: (url: string) => void
  onReset: () => void
  isLoading: boolean
}

export default function ScanInputCard({ onScan, onReset, isLoading }: ScanInputCardProps) {
  const [urlInput, setUrlInput] = useState('')

  const exampleChips = ['google.com', 'amazon.com', 'paypal.com', 'dropbox.com']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      onScan(urlInput.trim())
    }
  }

  const handleChipClick = (chip: string) => {
    // Add protocol if missing for better URL appearance
    const formattedUrl = chip.includes('://') ? chip : `https://${chip}`
    setUrlInput(formattedUrl)
  }

  const handleClear = () => {
    setUrlInput('')
    onReset()
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition-all duration-300 hover:border-slate-800/90">
      <div>
        <h2 className="text-base font-bold text-white leading-none">Scan a URL</h2>
        <p className="text-xs text-slate-500 mt-1">Enter any URL to analyze for security threats</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative flex flex-col sm:flex-row gap-2">
          {/* Input text field */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <LinkIcon className="w-4 h-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/login"
              disabled={isLoading}
              className="w-full py-2.5 pl-10 pr-4 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>

          {/* Action button */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="flex-1 sm:flex-initial py-2.5 px-5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              <span>{isLoading ? 'Analyzing...' : 'Analyze URL'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {urlInput && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg border border-slate-800 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Example Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Examples:</span>
          {exampleChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
