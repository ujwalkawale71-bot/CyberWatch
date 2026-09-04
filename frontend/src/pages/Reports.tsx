import { useState, useEffect } from 'react'
import { Plus, CheckCircle } from 'lucide-react'
import ReportsKpiRow from '../components/reports/ReportsKpiRow'
import RecentReportsTable from '../components/reports/RecentReportsTable'
import ReportTypesCard from '../components/reports/ReportTypesCard'
import ReportsOverviewChart from '../components/reports/ReportsOverviewChart'
import ReportCategoriesChart from '../components/reports/ReportCategoriesChart'
import ScheduledReportsTable from '../components/reports/ScheduledReportsTable'
import ReportPreviewCard from '../components/reports/ReportPreviewCard'
import CustomReportsCard from '../components/reports/CustomReportsCard'
import { reportsDemoData } from '../data/reportsDemoData'

export default function Reports() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (message: string) => {
    setToastMsg(message)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reports</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Generate and manage security reports.
          </p>
        </div>

        {/* Generate Report button */}
        <button
          onClick={() => handleAction('Action "Generate New Report" logged locally')}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/10 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Row 1: KPI Cards */}
      <ReportsKpiRow kpis={reportsDemoData.kpis} />

      {/* Row 2: Recent Reports Table + Types cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentReportsTable
          reports={reportsDemoData.recentReports}
          onDownload={(name) => handleAction(`Report "${name}" download initiated`)}
          onMore={(name) => handleAction(`Opened options menu for report "${name}"`)}
        />
        <ReportTypesCard />
      </div>

      {/* Row 3: Overview Area Chart + Donut categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsOverviewChart />
        <ReportCategoriesChart />
      </div>

      {/* Row 4: Scheduled lists + Preview viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScheduledReportsTable />
        <ReportPreviewCard
          onDownload={(name) => handleAction(`Report "${name}" download initiated from preview`)}
        />
      </div>

      {/* Row 5: Custom full width prompt card */}
      <CustomReportsCard
        onCreate={() => handleAction('Action "Create Custom Report" logged locally')}
      />
    </div>
  )
}
