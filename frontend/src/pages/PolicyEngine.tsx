import { useState, useEffect } from 'react'
import { Plus, CheckCircle } from 'lucide-react'
import PolicyKpiRow from '../components/policy-engine/PolicyKpiRow'
import PoliciesList from '../components/policy-engine/PoliciesList'
import PolicyDetailsPanel from '../components/policy-engine/PolicyDetailsPanel'
import ActionsResponseCard from '../components/policy-engine/ActionsResponseCard'
import ExceptionsCard from '../components/policy-engine/ExceptionsCard'
import PolicyActivityLog from '../components/policy-engine/PolicyActivityLog'
import CreatePolicyForm from '../components/policy-engine/CreatePolicyForm'
import { policyEngineDemoData } from '../data/policyEngineDemoData'
import type { PolicyItem } from '../types/policyEngine'

export default function PolicyEngine() {
  const [policies, setPolicies] = useState<PolicyItem[]>(policyEngineDemoData.policies)
  const [selectedId, setSelectedId] = useState(policyEngineDemoData.policies[0].id)
  const [isFormOpen, setIsFormOpen] = useState(false)
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

  const selectedPolicy = policies.find((pol) => pol.id === selectedId) || policies[0]

  const handleCreatePolicy = (newPolicy: {
    name: string
    description: string
    type: 'Web Protection' | 'Extension Control' | 'Behavior Control' | 'Data Protection'
    action: 'Allow' | 'Monitor' | 'Warn' | 'Block' | 'Quarantine'
    status: 'Active' | 'Paused' | 'Inactive'
    riskThreshold: number
  }) => {
    const newId = `pol-item-created-${Date.now()}`
    const createdItem: PolicyItem = {
      id: newId,
      name: newPolicy.name,
      description: newPolicy.description || 'No description provided.',
      priority: policies.length + 1,
      type: newPolicy.type,
      status: newPolicy.status,
      createdBy: 'SecOps Admin',
      createdOn: 'Just now',
      lastModified: 'Just now',
      rules: [
        {
          name: `Default ${newPolicy.type} Rule`,
          condition: `Risk Score exceeds ${newPolicy.riskThreshold}`,
          action: newPolicy.action,
          severity: 'HIGH'
        }
      ],
      scope: {
        usersIncluded: 'All Users',
        usersExcluded: 'None',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'None',
        devices: 'All Managed Devices',
        locations: 'All Locations'
      }
    }

    setPolicies([createdItem, ...policies])
    setSelectedId(newId)
    setIsFormOpen(false)
    handleAction(`Policy "${newPolicy.name}" created successfully inside local state`)
  }

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Policy Engine</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Create, manage, and enforce security policies across your organization.
          </p>
        </div>

        {/* Create Policy Trigger button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/10 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Policy</span>
        </button>
      </div>

      {/* Row 1: KPI Summary Row */}
      <PolicyKpiRow kpis={policyEngineDemoData.kpis} />

      {/* Row 2: Policies List + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PoliciesList
          policies={policies}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <PolicyDetailsPanel policy={selectedPolicy} />
      </div>

      {/* Row 3: Available Action Order Lists + Exceptions overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionsResponseCard />
        <ExceptionsCard
          exceptions={policyEngineDemoData.exceptions}
          onAdd={() => handleAction('Exception override creation wizard logged locally')}
        />
      </div>

      {/* Row 4: Activity Enforcement Table Logs */}
      <PolicyActivityLog />

      {/* Modal Dialog Form */}
      {isFormOpen && (
        <CreatePolicyForm
          onCreate={handleCreatePolicy}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  )
}
