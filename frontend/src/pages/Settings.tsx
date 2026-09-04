import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import SettingsNav from '../components/settings/SettingsNav'
import GeneralSettings from '../components/settings/GeneralSettings'
import ScanEngineSettings from '../components/settings/ScanEngineSettings'
import RealtimeProtectionSettings from '../components/settings/RealtimeProtectionSettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import IntegrationsSettings from '../components/settings/IntegrationsSettings'
import UserManagementSettings from '../components/settings/UserManagementSettings'
import SystemMaintenanceSettings from '../components/settings/SystemMaintenanceSettings'
import DataPrivacySettings from '../components/settings/DataPrivacySettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import AdvancedSettings from '../components/settings/AdvancedSettings'
import SystemStatusSidebar from '../components/settings/SystemStatusSidebar'
import { settingsUsers, settingsIntegrations, settingsMaintenance } from '../data/settingsDemoData'
import type { SettingsSection } from '../types/settings'

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
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

  const handleSave = () => {
    handleAction('Settings saved locally (backend not connected)')
  }

  const handleTestAlert = () => {
    handleAction('Test notification dispatch logged locally')
  }

  const handleConfigure = (name: string) => {
    handleAction(`Integration "${name}" connection interface opened locally`)
  }

  const handleInvite = () => {
    handleAction('User invitation code generated and copied to clipboard')
  }

  const handleMaintenanceAction = (actionName: string) => {
    handleAction(`System command "${actionName}" triggered successfully`)
  }

  const handleDeleteData = () => {
    handleAction('All localized application history cleared successfully')
  }

  const handleReset = () => {
    handleAction('Risk parameters restored to system default settings')
  }

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-[#202428] border border-[#343A40] px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-[#4FAF78] flex-shrink-0" />
          <span className="text-[11px] font-bold text-[#F1F3F4]">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-[#343A40]/40 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Configure system preferences, security modules, and global settings.
        </p>
      </div>

      {/* Left nav + Center content + Right status panel split */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-60 flex-shrink-0">
          <SettingsNav activeSection={activeSection} onChange={setActiveSection} />
        </div>

        {/* Content panel */}
        <div className="flex-1 w-full p-6 bg-[#202428] border border-[#343A40] rounded-xl hover:border-[#272C30] transition-colors">
          {activeSection === 'general' && <GeneralSettings onSave={handleSave} />}
          {activeSection === 'scan-engine' && <ScanEngineSettings onSave={handleSave} />}
          {activeSection === 'realtime' && <RealtimeProtectionSettings onSave={handleSave} />}
          {activeSection === 'notifications' && (
            <NotificationSettings onSave={handleSave} onTestAlert={handleTestAlert} />
          )}
          {activeSection === 'integrations' && (
            <IntegrationsSettings
              integrations={settingsIntegrations}
              onConfigure={handleConfigure}
              onTestConnection={(name) => handleAction(`Test connection to ${name} successful`)}
            />
          )}
          {activeSection === 'user-mgmt' && (
            <UserManagementSettings
              users={settingsUsers}
              onInvite={handleInvite}
              onAction={handleAction}
            />
          )}
          {activeSection === 'maintenance' && (
            <SystemMaintenanceSettings info={settingsMaintenance} onAction={handleMaintenanceAction} />
          )}
          {activeSection === 'privacy' && (
            <DataPrivacySettings
              onSave={handleSave}
              onDeleteData={handleDeleteData}
              onAction={handleAction}
            />
          )}
          {activeSection === 'appearance' && <AppearanceSettings onSave={handleSave} />}
          {activeSection === 'advanced' && <AdvancedSettings onReset={handleReset} onSave={handleSave} />}
        </div>

        {/* Right Status Panel */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <SystemStatusSidebar />
        </div>
      </div>
    </div>
  )
}
