import { useState } from 'react'
import { Eye, EyeOff, RotateCcw, ShieldCheck, Key, Link } from 'lucide-react'

interface AdvancedSettingsProps {
  onReset: () => void
  onSave: () => void
}

export default function AdvancedSettings({ onReset, onSave }: AdvancedSettingsProps) {
  const [revealKey, setRevealKey] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [devOptions, setDevOptions] = useState(false)
  const [auditLogging, setAuditLogging] = useState(true)
  const [rateLimit, setRateLimit] = useState(60)
  const [webhookUrl, setWebhookUrl] = useState('https://org.cyberwatch.ai/hooks/threats')
  const [hstsHeader, setHstsHeader] = useState(true)
  const [cspHeader, setCspHeader] = useState(true)

  const apiKeyMasked = 'sk-••••••••••••••••••••••••'
  const apiKeyRaw = 'sk-cyberwatch32884threatkey'

  const handleResetClick = () => {
    const ok = window.confirm('Are you sure you want to reset all advanced developer configurations to defaults?')
    if (ok) {
      setRevealKey(false)
      setDebugMode(false)
      setDevOptions(false)
      setAuditLogging(true)
      setRateLimit(60)
      setWebhookUrl('https://org.cyberwatch.ai/hooks/threats')
      setHstsHeader(true)
      setCspHeader(true)
      onReset()
    }
  }

  const toggleSwitch = (state: boolean, setter: (val: boolean) => void) => (
    <button
      type="button"
      onClick={() => setter(!state)}
      className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
        state ? 'bg-[#2A9D8F]' : 'bg-[#343A40]'
      }`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all flex items-center justify-center ${
          state ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6 text-left text-xs font-semibold">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">Advanced Settings</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Configure developer API endpoints, webhooks, and security headers</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Configurations */}
        <div className="lg:col-span-2 space-y-5">
          {/* API Keys & Webhooks */}
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">API &amp; Webhooks</h3>

            {/* Base Endpoint */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">API Base Endpoint</label>
              <div className="font-mono text-[#F1F3F4] select-all py-2 px-3 rounded-lg bg-[#171A1D] border border-[#3A4147] w-full">
                http://localhost:8000/api/v1
              </div>
            </div>

            {/* Threat intelligence key */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4] flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-[#747B82]" />
                <span>Threat Intelligence Core API Key</span>
              </label>
              <div className="flex gap-2 items-center w-full">
                <div className="flex-1 font-mono text-[#F1F3F4] py-2 px-3 rounded-lg bg-[#171A1D] border border-[#3A4147] select-all truncate">
                  {revealKey ? apiKeyRaw : apiKeyMasked}
                </div>
                <button
                  type="button"
                  onClick={() => setRevealKey(!revealKey)}
                  className="p-2.5 rounded-lg bg-[#202428] hover:bg-[#272C30] border border-[#343A40] text-[#A7ADB4] hover:text-[#F1F3F4] transition-colors cursor-pointer"
                >
                  {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4] flex items-center space-x-1">
                <Link className="w-3.5 h-3.5 text-[#747B82]" />
                <span>Webhook Threat Notification URL</span>
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full py-2 px-3 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-mono"
              />
            </div>
          </div>

          {/* Security Headers & Audit Logs */}
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Security Headers &amp; Auditing</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HSTS */}
              <div className="p-3 rounded-lg border border-[#343A40]/40 bg-[#171A1D]/15 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-[#F1F3F4] block leading-none">Strict HSTS Header</span>
                  <span className="text-[10px] text-[#747B82] leading-none block font-semibold mt-1">Enforce HTTPS transport.</span>
                </div>
                {toggleSwitch(hstsHeader, setHstsHeader)}
              </div>

              {/* CSP */}
              <div className="p-3 rounded-lg border border-[#343A40]/40 bg-[#171A1D]/15 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-[#F1F3F4] block leading-none">CSP Policy Rules</span>
                  <span className="text-[10px] text-[#747B82] leading-none block font-semibold mt-1">Restrict scripts hostings.</span>
                </div>
                {toggleSwitch(cspHeader, setCspHeader)}
              </div>

              {/* Audit logs */}
              <div className="p-3 rounded-lg border border-[#343A40]/40 bg-[#171A1D]/15 flex items-center justify-between gap-4 sm:col-span-2">
                <div className="space-y-1">
                  <span className="font-bold text-[#F1F3F4] block leading-none">System Audit Logging</span>
                  <span className="text-[10px] text-[#747B82] leading-none block font-semibold mt-1">
                    Trace all configuration changes and administrator sessions to database.
                  </span>
                </div>
                {toggleSwitch(auditLogging, setAuditLogging)}
              </div>
            </div>
          </div>
        </div>

        {/* Right (1 col): Developer Rules */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Developer Options</h3>

              {/* Debug Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F1F3F4] block">Debug Mode</span>
                  <span className="text-[10px] text-[#747B82] font-semibold mt-0.5 block">Log telemetry outputs.</span>
                </div>
                {toggleSwitch(debugMode, setDebugMode)}
              </div>

              {/* Developer Options Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F1F3F4] block">Developer Dashboard</span>
                  <span className="text-[10px] text-[#747B82] font-semibold mt-0.5 block">Show backend diagnostic stats.</span>
                </div>
                {toggleSwitch(devOptions, setDevOptions)}
              </div>

              {/* Rate Limits */}
              <div className="space-y-2 pt-2 border-t border-[#343A40]/50">
                <div className="flex justify-between">
                  <span className="text-[#A7ADB4]">API Rate Limit</span>
                  <span className="font-mono text-[#2A9D8F] font-bold">{rateLimit} req/min</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full h-1 bg-[#343A40] rounded-lg appearance-none cursor-pointer accent-[#2A9D8F]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#4FAF78]/10 border border-[#4FAF78]/15 text-[#4FAF78] rounded-lg flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Developer mode values compile cleanly.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons footer */}
      <div className="pt-4 border-t border-[#343A40] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleResetClick}
          className="py-2.5 px-4 rounded-lg bg-[#202428] hover:bg-[#272C30] border border-[#343A40] text-[#A7ADB4] hover:text-[#F1F3F4] font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          className="py-2.5 px-6 font-bold text-white bg-[#2A9D8F] hover:bg-[#238276] rounded-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
