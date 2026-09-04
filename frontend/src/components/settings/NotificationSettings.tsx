import { useState } from 'react'
import { Check } from 'lucide-react'

interface NotificationSettingsProps {
  onSave: () => void
  onTestAlert: () => void
}

export default function NotificationSettings({ onSave, onTestAlert }: NotificationSettingsProps) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [critAlerts, setCritAlerts] = useState(true)
  const [highAlerts, setHighAlerts] = useState(true)
  const [dailySummary, setDailySummary] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [desktopNotif, setDesktopNotif] = useState(true)
  const [emailAddress, setEmailAddress] = useState('admin@company.com')

  // Checkboxes
  const [critFilter, setCritFilter] = useState(true)
  const [highFilter, setHighFilter] = useState(true)
  const [medFilter, setMedFilter] = useState(true)
  const [lowFilter, setLowFilter] = useState(false)
  const [infoFilter, setInfoFilter] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  const handleReset = () => {
    setEmailAlerts(true)
    setCritAlerts(true)
    setHighAlerts(true)
    setDailySummary(false)
    setWeeklyReports(true)
    setDesktopNotif(true)
    setEmailAddress('admin@company.com')
    setCritFilter(true)
    setHighFilter(true)
    setMedFilter(true)
    setLowFilter(false)
    setInfoFilter(false)
  }

  const channels = [
    { id: 'ea', label: 'Email Alerts', desc: 'Dispatch instant alerts reports to configured admins.', state: emailAlerts, setter: setEmailAlerts },
    { id: 'dn', label: 'Desktop Notifications', desc: 'Display live browser window popup notifications.', state: desktopNotif, setter: setDesktopNotif },
    { id: 'ca', label: 'Critical Threat Alerts', desc: 'Bypass snoozes to dispatch SMS/Email instantly for critical alarms.', state: critAlerts, setter: setCritAlerts },
    { id: 'ha', label: 'High Risk Alerts', desc: 'Standard incident alarm dispatching rules.', state: highAlerts, setter: setHighAlerts },
    { id: 'ds', label: 'Daily Security Summary', desc: 'Recap scan stats, alerts, and system health daily.', state: dailySummary, setter: setDailySummary },
    { id: 'wr', label: 'Weekly Reports', desc: 'In-depth analysis report generated every Sunday.', state: weeklyReports, setter: setWeeklyReports }
  ]

  const severityCheckboxes = [
    { label: 'Critical', state: critFilter, setter: setCritFilter, color: 'text-[#D9534F]' },
    { label: 'High', state: highFilter, setter: setHighFilter, color: 'text-[#E07A3F]' },
    { label: 'Medium', state: medFilter, setter: setMedFilter, color: 'text-[#D4A72C]' },
    { label: 'Low', state: lowFilter, setter: setLowFilter, color: 'text-[#6C9BD2]' },
    { label: 'Informational', state: infoFilter, setter: setInfoFilter, color: 'text-[#747B82]' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">Notification Settings</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Configure alert channels and severity filters</span>
      </div>

      <div className="space-y-5 text-xs font-semibold">
        {/* Card 1: Alert Channels */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Alert Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-[#343A40]/40 bg-[#171A1D]/15 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="font-bold text-[#F1F3F4] block leading-none">{item.label}</span>
                  <p className="text-[10px] text-[#747B82] font-semibold leading-normal mt-1.5">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => item.setter(!item.state)}
                  className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                    item.state ? 'bg-[#2A9D8F]' : 'bg-[#343A40]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all flex items-center justify-center ${
                      item.state ? 'right-0.5' : 'left-0.5'
                    }`}
                  >
                    {item.state && <Check className="w-2.5 h-2.5 text-[#2A9D8F]" />}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Severity Filters */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Severity Filters</h3>
          <p className="text-[10px] text-[#747B82] leading-normal font-semibold">
            Only dispatch alerts for incidents matching checked severity tags:
          </p>
          <div className="flex flex-wrap gap-4 items-center pt-1.5">
            {severityCheckboxes.map((item) => (
              <label key={item.label} className="flex items-center space-x-2.5 cursor-pointer font-bold text-[#F1F3F4]">
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#171A1D] border-[#3A4147] text-[#2A9D8F] focus:ring-[#2A9D8F] focus:ring-offset-0"
                />
                <span className={item.color}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Recipient Configuration Block */}
        <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
          <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Recipient Details</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1.5 flex-1 max-w-md w-full">
              <label className="text-[#A7ADB4]">Alert Recipient Email</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-semibold"
              />
            </div>
            <button
              type="button"
              onClick={onTestAlert}
              className="py-2.5 px-5 bg-[#202428] hover:bg-[#272C30] border border-[#343A40] rounded-lg font-bold text-[#A7ADB4] hover:text-[#F1F3F4] transition-colors flex-shrink-0 w-full sm:w-auto text-center"
            >
              Send Test Alert
            </button>
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
