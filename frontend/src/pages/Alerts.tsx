import { useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import AlertsKpiRow from '../components/alerts/AlertsKpiRow'
import RecentAlertsTable from '../components/alerts/RecentAlertsTable'
import AlertDistributionChart from '../components/alerts/AlertDistributionChart'
import AlertsBySourceChart from '../components/alerts/AlertsBySourceChart'
import AlertDetailsPanel from '../components/alerts/AlertDetailsPanel'
import { alertsDemoData } from '../data/alertsDemoData'

export default function Alerts() {
  const [selectedAlertId, setSelectedAlertId] = useState(alertsDemoData.alerts[0].id)

  const selectedAlert =
    alertsDemoData.alerts.find((alert) => alert.id === selectedAlertId) ||
    alertsDemoData.alerts[0]

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Alerts</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Real-time alerts and notifications from all security engines.
          </p>
        </div>

        {/* Top-Right dropdown actions */}
        <div className="flex items-center space-x-2">
          {/* Dropdown UI */}
          <button className="flex items-center space-x-1.5 py-2 px-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <span>All Time</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Filter Trigger button */}
          <button className="flex items-center space-x-1.5 py-2 px-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <AlertsKpiRow kpis={alertsDemoData.kpis} />

      {/* Row 2: Recent Alerts Table + Stacked Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlertsTable
          alerts={alertsDemoData.alerts}
          selectedId={selectedAlertId}
          onSelect={setSelectedAlertId}
        />

        {/* Stacked Chart columns */}
        <div className="flex flex-col gap-4">
          <AlertDistributionChart />
          <AlertsBySourceChart />
        </div>
      </div>

      {/* Row 3: Alert details full width details */}
      <AlertDetailsPanel alert={selectedAlert} />
    </div>
  )
}
