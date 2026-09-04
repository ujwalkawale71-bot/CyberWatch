import { useState, useRef, useEffect } from 'react'
import { Search, Bell, Moon, ChevronDown, Menu, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface TopHeaderProps {
  onMenuClick: () => void
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Get initials
  const getInitials = (name: string) => {
    if (!name) return 'US'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#343A40] bg-[#15181B]/80 backdrop-blur-md flex items-center justify-between px-6 text-[#F1F3F4]">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center flex-1 max-w-md mr-4">
        {/* Hamburger Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="p-2 mr-3 rounded-lg text-[#A7ADB4] hover:text-[#F1F3F4] hover:bg-[#202428] lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Box */}
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-[#A7ADB4] group-focus-within:text-[#2A9D8F] transition-colors" />
          </span>
          <input
            type="text"
            placeholder="Search URL, Domain, IP, Extension ID..."
            className="w-full py-2 pl-10 pr-4 bg-[#171A1D] border border-[#3A4147] rounded-lg text-sm text-[#F1F3F4] placeholder-[#747B82] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] transition-all font-medium"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Dark/Light mode toggle (non-functional) */}
        <button className="p-2 rounded-lg text-[#A7ADB4] hover:text-[#F1F3F4] hover:bg-[#202428] transition-colors">
          <Moon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[#A7ADB4] hover:text-[#F1F3F4] hover:bg-[#202428] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9534F] text-[9px] font-bold text-white ring-2 ring-[#15181B]">
            7
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-[#343A40]" />

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#2A9D8F] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {getInitials(user?.name || '')}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F1F3F4] leading-none">
                {user?.name || 'User Profile'}
              </span>
              <span className="text-[10px] text-[#A7ADB4] mt-0.5 leading-none font-bold uppercase tracking-wider">
                {user?.role || 'User'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#A7ADB4] group-hover:text-[#F1F3F4] transition-colors" />
          </div>

          {/* Dropdown Card */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-[#343A40] bg-[#202428] shadow-lg py-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-1.5 duration-200">
              <div className="px-4 py-2 border-b border-[#343A40] text-left">
                <span className="block font-bold text-[#F1F3F4] truncate">{user?.name}</span>
                <span className="block text-[10px] text-[#A7ADB4] truncate mt-0.5">{user?.email}</span>
                <span className="inline-block text-[9px] text-white bg-[#2A9D8F] px-1.5 py-0.2 rounded mt-1.5 font-bold uppercase">
                  {user?.role || 'User'}
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-4 py-2 text-left text-[#A7ADB4] hover:text-[#F1F3F4] hover:bg-[#272C30] flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[#D9534F] hover:bg-[#D9534F]/5 flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
