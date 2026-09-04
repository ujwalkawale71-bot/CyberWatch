import { FileText, FileSpreadsheet, FileArchive, Download } from 'lucide-react'

interface ReportPreviewCardProps {
  onDownload: (name: string) => void
}

export default function ReportPreviewCard({ onDownload }: ReportPreviewCardProps) {
  const formats = [
    { label: 'PDF Format', icon: FileText, color: 'text-red-500 bg-red-500/10' },
    { label: 'CSV Format', icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Word Doc', icon: FileArchive, color: 'text-blue-500 bg-blue-500/10' }
  ]

  const threatItems = [
    { name: 'Phishing URLs', count: 543 },
    { name: 'Malicious Websites', count: 327 },
    { name: 'Malicious Extensions', count: 119 },
    { name: 'Behavior Anomalies', count: 84 }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Report Preview</h2>
        <span className="text-xs text-slate-500 mt-1 block">Live interactive layout preview</span>
      </div>

      {/* Styled Mock Document Box */}
      <div className="flex-1 my-3 rounded-lg border border-slate-850 bg-slate-950/40 p-3.5 flex flex-col justify-between text-[10px] leading-relaxed relative select-none">
        {/* Document Header */}
        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="font-extrabold text-[9px] text-blue-500 tracking-wider uppercase font-mono">
              CyberWatch AI
            </span>
          </div>
          <span className="text-[8px] text-slate-550 font-mono">Generated: May 15, 2025</span>
        </div>

        {/* Document Title */}
        <div className="pt-2 text-center">
          <h3 className="text-xs font-black text-slate-200 tracking-tight leading-none">
            Daily Security Report
          </h3>
        </div>

        {/* Two side columns */}
        <div className="grid grid-cols-2 gap-3 pt-3 flex-1 items-center">
          {/* Left: Overall Risk Score (78 High Risk) */}
          <div className="flex flex-col items-center justify-center border-r border-slate-850/60 pr-2">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Inner ring */}
              <div className="absolute inset-0 rounded-full border-2 border-slate-850" />
              <div className="absolute inset-0 rounded-full border-2 border-t-red-500 rotate-[45deg]" />
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-slate-200 leading-none">78</span>
                <span className="text-[6.5px] text-slate-500 font-bold uppercase scale-90 leading-none mt-0.5">
                  /100
                </span>
              </div>
            </div>
            <span className="text-[7.5px] font-extrabold tracking-widest text-red-500 uppercase mt-1">
              HIGH RISK
            </span>
          </div>

          {/* Right: Top threats list */}
          <div className="space-y-1">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Top Threats:
            </span>
            {threatItems.map((threat) => (
              <div key={threat.name} className="flex justify-between border-b border-slate-850/40 pb-0.5 last:border-0 text-slate-400 font-semibold">
                <span className="truncate max-w-[55px]">{threat.name}</span>
                <span className="font-mono text-slate-250 font-bold">{threat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Format selections and Download button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Format icons */}
        <div className="flex space-x-1.5">
          {formats.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className={`p-1.5 rounded-lg border border-slate-800 ${f.color}`}
                title={f.label}
              >
                <Icon className="w-4 h-4" />
              </div>
            )
          })}
        </div>

        {/* Download Action button */}
        <button
          onClick={() => onDownload('Daily Security Report')}
          className="flex-1 py-2 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/10"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  )
}
