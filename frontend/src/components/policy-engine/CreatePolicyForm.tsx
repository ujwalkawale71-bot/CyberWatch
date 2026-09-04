import { useState } from 'react'
import { X } from 'lucide-react'

interface CreatePolicyFormProps {
  onCreate: (newPolicy: {
    name: string
    description: string
    type: 'Web Protection' | 'Extension Control' | 'Behavior Control' | 'Data Protection'
    action: 'Allow' | 'Monitor' | 'Warn' | 'Block' | 'Quarantine'
    status: 'Active' | 'Paused' | 'Inactive'
    riskThreshold: number
  }) => void
  onClose: () => void
}

export default function CreatePolicyForm({ onCreate, onClose }: CreatePolicyFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'Web Protection' | 'Extension Control' | 'Behavior Control' | 'Data Protection'>('Web Protection')
  const [action, setAction] = useState<'Allow' | 'Monitor' | 'Warn' | 'Block' | 'Quarantine'>('Block')
  const [isActive, setIsActive] = useState(true)
  const [riskThreshold, setRiskThreshold] = useState(80)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onCreate({
      name: name.trim(),
      description: description.trim(),
      type,
      action,
      status: isActive ? 'Active' : 'Paused',
      riskThreshold
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 text-left flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create New Policy</h3>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-950/20 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-300">
          {/* Policy Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-400">Policy Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Block Unverified Domain Extensions"
              className="w-full py-2 px-3 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-400">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed summary of policy scope and blocking rules..."
              className="w-full py-2 px-3 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Type and Action row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Policy Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full py-2 px-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="Web Protection">Web Protection</option>
                <option value="Extension Control">Extension Control</option>
                <option value="Behavior Control">Behavior Control</option>
                <option value="Data Protection">Data Protection</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Default Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full py-2 px-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="Allow">Allow</option>
                <option value="Monitor">Monitor</option>
                <option value="Warn">Warn</option>
                <option value="Block">Block</option>
                <option value="Quarantine">Quarantine</option>
              </select>
            </div>
          </div>

          {/* Risk and Status toggle row */}
          <div className="grid grid-cols-2 gap-4 items-center pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Risk Threshold (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="font-semibold text-slate-400">Status</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`py-2 px-4 rounded-lg font-bold border leading-none transition-colors text-center ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20'
                }`}
              >
                {isActive ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 font-semibold text-slate-450 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98] shadow-sm shadow-blue-500/10"
            >
              Create Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
