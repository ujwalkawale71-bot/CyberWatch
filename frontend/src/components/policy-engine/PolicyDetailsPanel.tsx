import { useState, useEffect } from 'react'
import { CheckCircle, Sliders } from 'lucide-react'
import type { PolicyItem } from '../../types/policyEngine'
import { SEVERITY_COLORS } from '../../utils/constants'

interface PolicyDetailsPanelProps {
  policy: PolicyItem
}

type ScopeTab = 'users' | 'devices' | 'network' | 'locations'

export default function PolicyDetailsPanel({ policy }: PolicyDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<ScopeTab>('users')
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

  const statusStyles =
    policy.status === 'Active'
      ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
      : policy.status === 'Paused'
      ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
      : 'bg-slate-800/40 text-slate-405 border border-slate-700/60'

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[540px] hover:border-slate-700 transition-colors text-left justify-between overflow-hidden">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3 gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <h2 className="text-base font-extrabold text-white tracking-tight truncate">
            {policy.name}
          </h2>
          <span
            className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none flex-shrink-0 ${statusStyles}`}
          >
            {policy.status.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => handleAction('Edit Policy')}
          className="py-1 px-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
        >
          Edit Policy
        </button>
      </div>

      {/* Scrollable middle content body */}
      <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1 scrollbar-thin scrollbar-thumb-slate-850 text-xs">
        {/* Description */}
        <p className="text-slate-350 font-medium leading-relaxed">
          {policy.description}
        </p>

        {/* Technical Key-Values */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-3 border-y border-slate-850/60 font-medium">
          <div className="flex justify-between border-b border-slate-850/30 pb-1">
            <span className="text-slate-500">Priority:</span>
            <span className="text-slate-300 font-bold font-mono">
              {policy.priority} ({policy.priority === 1 ? 'Highest' : 'High'})
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-850/30 pb-1">
            <span className="text-slate-500">Policy Type:</span>
            <span className="text-slate-300 font-bold">{policy.type}</span>
          </div>
          <div className="flex justify-between border-b border-slate-850/30 pb-1">
            <span className="text-slate-500">Created By:</span>
            <span className="text-slate-350">{policy.createdBy}</span>
          </div>
          <div className="flex justify-between border-b border-slate-850/30 pb-1">
            <span className="text-slate-500">Last Modified:</span>
            <span className="text-slate-350 font-mono">{policy.lastModified}</span>
          </div>
        </div>

        {/* Policy Rules list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Policy Rules</h3>
            <button
              onClick={() => handleAction('Add New Rule')}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
            >
              + Add New Rule
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-850/80 rounded-lg">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2 px-3">Rule Name</th>
                  <th className="py-2 px-3">Condition</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-slate-300">
                {policy.rules.map((rule, idx) => {
                  const colorSet = SEVERITY_COLORS[rule.severity] || SEVERITY_COLORS.LOW
                  return (
                    <tr key={idx} className="hover:bg-slate-950/5">
                      <td className="py-2 px-3 font-bold text-slate-200">{rule.name}</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-450">{rule.condition}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-300">{rule.action}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                        >
                          {rule.severity}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Scope tabs section */}
        <div className="space-y-2 pt-2 border-t border-slate-850/40">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Policy Scope</h3>
            <button
              onClick={() => handleAction('Manage Scope')}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
            >
              Manage Scope
            </button>
          </div>

          {/* Scope tabs selector */}
          <div className="flex space-x-1 p-0.5 bg-slate-950/50 rounded-md border border-slate-850/50">
            {(['users', 'devices', 'network', 'locations'] as ScopeTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1 rounded text-[9px] font-extrabold tracking-wider uppercase transition-all ${
                  activeTab === tab
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'users' ? 'Users/Groups' : tab}
              </button>
            ))}
          </div>

          {/* Scope content mapping */}
          <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-lg text-[11px] space-y-2">
            {activeTab === 'users' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Users Scope</span>
                  <div className="font-semibold text-slate-300">Included: {policy.scope.usersIncluded}</div>
                  <div className="text-slate-500">Excluded: {policy.scope.usersExcluded}</div>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Groups Scope</span>
                  <div className="font-semibold text-slate-300">Included: {policy.scope.groupsIncluded}</div>
                  <div className="text-slate-500">Excluded: {policy.scope.groupsExcluded}</div>
                </div>
              </div>
            ) : activeTab === 'devices' ? (
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Device Targets</span>
                <div className="font-semibold text-slate-300">{policy.scope.devices}</div>
              </div>
            ) : activeTab === 'network' ? (
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Network Interfaces</span>
                <div className="font-semibold text-slate-300">Internal Subnets, Corporate VPN, Remote LAN</div>
              </div>
            ) : (
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Locations Scope</span>
                <div className="font-semibold text-slate-300">{policy.scope.locations}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button action */}
      <button
        onClick={() => handleAction('Enforce Policy')}
        className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/10"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Enforce Configured Scope</span>
      </button>
    </div>
  )
}
