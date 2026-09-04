import { Users, Plus, Trash2, Edit2 } from 'lucide-react'
import type { SettingsUser } from '../../types/settings'

interface UserManagementSettingsProps {
  users: SettingsUser[]
  onInvite: () => void
  onAction: (msg: string) => void
}

export default function UserManagementSettings({ users, onInvite, onAction }: UserManagementSettingsProps) {
  // Compute metrics
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'Active').length
  const admins = users.filter((u) => u.role === 'Administrator').length

  const handleUserAction = (name: string, action: string) => {
    onAction(`Action "${action}" on user "${name}" initiated (mock API)`)
  }

  return (
    <div className="space-y-6 text-left flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#343A40] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#F1F3F4] leading-none">User Management</h2>
          <span className="text-xs text-[#747B82] mt-1 block">Audit operators and workspace roles permissions</span>
        </div>
        <button
          onClick={onInvite}
          className="py-2 px-4 bg-[#2A9D8F] hover:bg-[#238276] text-white rounded-lg text-[10.5px] font-bold transition-all shadow-sm active:scale-95 flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
        <div className="p-3 rounded-lg border border-[#343A40] bg-[#171A1D]/25">
          <span className="text-[#747B82] text-[9px] uppercase font-bold tracking-wider block">Total Users</span>
          <span className="text-sm font-extrabold text-[#F1F3F4] font-mono mt-1 block">{totalUsers}</span>
        </div>
        <div className="p-3 rounded-lg border border-[#343A40] bg-[#171A1D]/25">
          <span className="text-[#747B82] text-[9px] uppercase font-bold tracking-wider block">Active Users</span>
          <span className="text-sm font-extrabold text-[#4FAF78] font-mono mt-1 block">{activeUsers}</span>
        </div>
        <div className="p-3 rounded-lg border border-[#343A40] bg-[#171A1D]/25">
          <span className="text-[#747B82] text-[9px] uppercase font-bold tracking-wider block">Administrators</span>
          <span className="text-sm font-extrabold text-[#F1F3F4] font-mono mt-1 block">{admins}</span>
        </div>
        <div className="p-3 rounded-lg border border-[#343A40] bg-[#171A1D]/25">
          <span className="text-[#747B82] text-[9px] uppercase font-bold tracking-wider block">Active Roles</span>
          <span className="text-sm font-extrabold text-[#2A9D8F] font-mono mt-1 block">3 Configured</span>
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto border border-[#343A40] rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#171A1D]/40 border-b border-[#343A40] text-[#747B82] font-bold uppercase tracking-wider text-[9px]">
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Email</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Last Active</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#343A40]/40">
            {users.map((row) => (
              <tr key={row.id} className="hover:bg-[#202428]/40 transition-colors">
                <td className="py-3 px-3 font-bold text-[#F1F3F4] truncate max-w-[130px]">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-[#747B82] flex-shrink-0" />
                    <span className="truncate">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-[#A7ADB4] select-all">{row.email}</td>
                <td className="py-3 px-3 text-[#A7ADB4] font-semibold">{row.role}</td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                      row.status === 'Active'
                        ? 'bg-[#4FAF78]/10 text-[#4FAF78] border-[#4FAF78]/20'
                        : 'bg-[#D4A72C]/10 text-[#D4A72C] border-[#D4A72C]/20'
                    }`}
                  >
                    {row.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[10.5px] text-[#747B82] tabular-nums">
                  {row.lastActive}
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex justify-end space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleUserAction(row.name, 'Edit Role')}
                      className="p-1 rounded bg-[#202428] hover:bg-[#272C30] border border-[#343A40] text-[#A7ADB4] hover:text-[#2A9D8F]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={row.role === 'Administrator'}
                      onClick={() => handleUserAction(row.name, 'Revoke Access')}
                      className={`p-1 rounded bg-[#202428] hover:bg-[#272C30] border border-[#343A40] text-[#A7ADB4] hover:text-[#D9534F] ${
                        row.role === 'Administrator' ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
