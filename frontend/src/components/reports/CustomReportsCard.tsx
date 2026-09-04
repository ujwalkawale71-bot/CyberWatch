import { Sliders, Plus } from 'lucide-react'

interface CustomReportsCardProps {
  onCreate: () => void
}

export default function CustomReportsCard({ onCreate }: CustomReportsCardProps) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:border-blue-500/30 transition-colors">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center space-x-2 text-blue-500">
          <Sliders className="w-5 h-5 flex-shrink-0" />
          <h2 className="text-base font-extrabold tracking-tight uppercase leading-none">
            Custom Reports
          </h2>
        </div>
        <p className="text-xs text-slate-350 font-semibold leading-relaxed">
          Need a custom report? Create reports with specific data, date ranges, and filters.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/10"
      >
        <Plus className="w-4 h-4" />
        <span>Create Custom Report</span>
      </button>
    </div>
  )
}
