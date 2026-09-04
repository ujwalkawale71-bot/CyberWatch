import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Link2,
  Globe2,
  Puzzle,
  Activity,
  Radar,
  Bell,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  Database,
  BookOpen,
  HelpCircle,
  Shield,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/url-scanner', label: 'URL / Phishing Scanner', icon: Link2 },
  { path: '/website-scanner', label: 'Website Scanner', icon: Globe2 },
  { path: '/extension-scanner', label: 'Extension Scanner', icon: Puzzle },
  { path: '/behavior', label: 'Behavior Monitor', icon: Activity, badge: 'BETA' },
  { path: '/threat-intelligence', label: 'Threat Intelligence', icon: Radar },
  { path: '/alerts', label: 'Alerts', icon: Bell, count: 7 },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/policies', label: 'Policy Engine', icon: ShieldCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/database', label: 'Database Explorer', icon: Database },
  { path: '/docs', label: 'Docs & API', icon: BookOpen },
  { path: '/help', label: 'Help & Support', icon: HelpCircle },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-60 bg-[#181B1F] border-r border-[#343A40] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo row */}
        <div className="p-4 border-b border-[#343A40] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2A9D8F] text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold leading-none tracking-tight">
                <span className="text-white">Cyber</span>
                <span className="text-[#2A9D8F]">Watch</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 font-semibold leading-none">
                Threat Detection Platform
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#202428] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group border border-transparent ${
                    isActive
                      ? 'bg-[#2A9D8F]/20 border-[#2A9D8F]/30 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#202428]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4.5 h-4.5 transition-colors ${
                          isActive
                            ? 'text-[#2A9D8F]'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Beta badge */}
                      {item.badge && (
                        <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-[#8A9A5B]/15 text-[#8A9A5B] border border-[#8A9A5B]/25">
                          {item.badge}
                        </span>
                      )}

                      {/* Notification Count badge */}
                      {item.count !== undefined && (
                        <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full bg-[#D9534F] text-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom: "Protection Status" card */}
        <div className="p-4 border-t border-[#343A40]">
          <div className="p-4 rounded-xl border border-[#4FAF78]/25 bg-[#4FAF78]/5 flex flex-col space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4FAF78]/10 text-[#4FAF78] flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#4FAF78] tracking-wider leading-none">ACTIVE</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-1 font-semibold">
                  Real-time protection enabled
                </div>
              </div>
            </div>
            <button className="w-full py-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg transition-colors">
              View Protection Logs
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
