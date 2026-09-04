import { useState } from 'react'

interface GeneralSettingsProps {
  onSave: () => void
}

export default function GeneralSettings({ onSave }: GeneralSettingsProps) {
  const [orgName, setOrgName] = useState('CyberWatch Inc.')
  const [orgId] = useState('ORG-9048-CW')
  const [adminEmail, setAdminEmail] = useState('admin@cyberwatch.ai')
  const [timezone, setTimezone] = useState('UTC+05:30 Asia/Kolkata')
  const [language, setLanguage] = useState('English')
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD')
  const [timeFormat, setTimeFormat] = useState('12-Hour')
  const [defaultDash, setDefaultDash] = useState('Overview')
  const [itemsPerPage, setItemsPerPage] = useState('25')
  const [autoLogout, setAutoLogout] = useState('30 Minutes')

  const handleReset = () => {
    setOrgName('CyberWatch Inc.')
    setAdminEmail('admin@cyberwatch.ai')
    setTimezone('UTC+05:30 Asia/Kolkata')
    setLanguage('English')
    setDateFormat('YYYY-MM-DD')
    setTimeFormat('12-Hour')
    setDefaultDash('Overview')
    setItemsPerPage('25')
    setAutoLogout('30 Minutes')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">General Settings</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Configure organization info and UI preferences</span>
      </div>

      <div className="space-y-5 text-xs font-semibold">
        {/* Card 1: Organization */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Organization Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Org Name */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full py-2 px-3 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              />
            </div>

            {/* Org ID */}
            <div className="space-y-1.5">
              <label className="text-[#747B82]">Organization ID (Read-only)</label>
              <input
                type="text"
                value={orgId}
                readOnly
                className="w-full py-2 px-3 bg-[#171A1D]/50 border border-[#3A4147] rounded-lg text-[#747B82] focus:outline-none font-mono font-bold"
              />
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full py-2 px-3 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="UTC+05:30 Asia/Kolkata">UTC+05:30 Asia/Kolkata</option>
                <option value="UTC+00:00 GMT/London">UTC+00:00 GMT/London</option>
                <option value="UTC-05:00 EST/New York">UTC-05:00 EST/New York</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Dashboard Preferences */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Dashboard Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Dashboard */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Default Dashboard View</label>
              <select
                value={defaultDash}
                onChange={(e) => setDefaultDash(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="Overview">Overview / Dashboard</option>
                <option value="Alerts">Alerts Log</option>
                <option value="Analytics">Analytics Dashboard</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>

            {/* Time Format */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Time Format</label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="12-Hour">12-Hour (AM/PM)</option>
                <option value="24-Hour">24-Hour</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Items Per Page</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-mono"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Auto Logout */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Session Auto Logout</label>
              <select
                value={autoLogout}
                onChange={(e) => setAutoLogout(e.target.value)}
                className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
              >
                <option value="15 Minutes">15 Minutes</option>
                <option value="30 Minutes">30 Minutes</option>
                <option value="1 Hour">1 Hour</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#343A40] flex space-x-3 text-xs">
        <button
          type="submit"
          className="py-2.5 px-6 font-bold text-white bg-[#2A9D8F] hover:bg-[#238276] rounded-lg transition-all shadow-sm active:scale-[0.98]"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="py-2.5 px-6 font-bold text-[#A7ADB4] bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg transition-all active:scale-[0.98]"
        >
          Reset Defaults
        </button>
      </div>
    </form>
  )
}
