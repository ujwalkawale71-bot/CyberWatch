import { useState } from 'react'

interface AppearanceSettingsProps {
  onSave: () => void
}

export default function AppearanceSettings({ onSave }: AppearanceSettingsProps) {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [primaryColor, setPrimaryColor] = useState('teal')
  const [fontSize, setFontSize] = useState('Medium')
  const [density, setDensity] = useState('Default')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  const handleReset = () => {
    setTheme('dark')
    setPrimaryColor('teal')
    setFontSize('Medium')
    setDensity('Default')
  }

  const themesList = [
    { id: 'dark', label: 'Dark Graphite', desc: 'Default theme matching dark cyber consoles.', locked: false },
    { id: 'light', label: 'Light Theme', desc: 'Locked in this development preview.', locked: true },
    { id: 'system', label: 'System Prefs', desc: 'Match browser window settings automatically.', locked: true }
  ]

  const accentColors = [
    { id: 'teal', hex: '#2A9D8F', name: 'Deep Teal (Primary)' },
    { id: 'blue', hex: '#6C9BD2', name: 'Soft Blue' },
    { id: 'emerald', hex: '#4FAF78', name: 'Emerald Safe' },
    { id: 'amber', hex: '#D4A72C', name: 'Amber Warning' }
  ]

  // CSS mappings for Live Preview
  const densityPaddingMap = {
    Compact: 'p-3 space-y-2',
    Default: 'p-4.5 space-y-3.5',
    Relaxed: 'p-6 space-y-5'
  }

  const fontSizeTextMap = {
    Small: 'text-[10px]',
    Medium: 'text-xs',
    Large: 'text-sm'
  }

  const accentColorHexMap = {
    teal: '#2A9D8F',
    blue: '#6C9BD2',
    emerald: '#4FAF78',
    amber: '#D4A72C'
  }

  const activeHex = accentColorHexMap[primaryColor as keyof typeof accentColorHexMap] || '#2A9D8F'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left text-xs font-semibold">
      <div className="border-b border-[#343A40] pb-3">
        <h2 className="text-base font-bold text-[#F1F3F4]">Appearance Settings</h2>
        <span className="text-xs text-[#747B82] mt-1 block">Customize dashboard colors, fonts, and densities</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (2 cols): Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Operating Theme */}
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-3">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Operating Theme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themesList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!item.locked) setTheme(item.id as any)
                  }}
                  className={`p-3 rounded-lg border text-left space-y-1 transition-all ${
                    theme === item.id
                      ? 'bg-[#202428] border-[#2A9D8F]'
                      : 'bg-[#171A1D]/10 border-[#343A40] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="font-bold text-[#F1F3F4] block leading-none">{item.label}</span>
                  <p className="text-[10px] text-[#747B82] leading-normal font-semibold">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent and Density */}
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4">
            <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">Accent &amp; Typography</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Accent Color */}
              <div className="space-y-2">
                <label className="text-[#A7ADB4] block">Primary Accent Color</label>
                <div className="flex space-x-3 items-center">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setPrimaryColor(color.id)}
                      className="w-7 h-7 rounded-full border transition-all relative flex-shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: color.hex,
                        borderColor: primaryColor === color.id ? '#F1F3F4' : '#343A40',
                        boxShadow: primaryColor === color.id ? `0 0 4px ${color.hex}` : 'none'
                      }}
                      title={color.name}
                    >
                      {primaryColor === color.id && (
                        <span className="absolute inset-1 border border-[#111315] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout properties */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[#A7ADB4]">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A7ADB4]">Display Density</label>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg text-[#F1F3F4] focus:outline-none focus:border-[#2A9D8F] font-medium"
                  >
                    <option value="Compact">Compact</option>
                    <option value="Default">Default</option>
                    <option value="Relaxed">Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (1 col): Preview */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#343A40] bg-[#171A1D]/25 space-y-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider mb-2">Live Preview</h3>
              <p className="text-[10px] text-[#747B82] leading-normal mb-4">
                Mock visual preview demonstrating current size, density, and color accents.
              </p>

              {/* Preview Window Box */}
              <div className="border border-[#343A40] rounded-xl bg-[#202428] text-[#F1F3F4] select-none text-left overflow-hidden">
                {/* Titlebar */}
                <div className="bg-[#15181B] px-3.5 py-2 border-b border-[#343A40] flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9534F]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4A72C]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4FAF78]/40" />
                </div>

                {/* Body container with padding */}
                <div className={densityPaddingMap[density as keyof typeof densityPaddingMap] || 'p-4.5 space-y-3.5'}>
                  <div className="flex items-center justify-between border-b border-[#343A40]/40 pb-2">
                    <span className="text-[9.5px] font-mono text-[#747B82] font-bold">MONITOR PROFILES</span>
                    <span
                      className="text-[8px] font-extrabold px-1 rounded-sm leading-none border"
                      style={{
                        color: activeHex,
                        borderColor: `${activeHex}25`,
                        backgroundColor: `${activeHex}10`
                      }}
                    >
                      SECURE
                    </span>
                  </div>

                  <p className={`${fontSizeTextMap[fontSize as keyof typeof fontSizeTextMap] || 'text-xs'} text-[#A7ADB4] leading-normal font-semibold`}>
                    This preview shows the typography spacing. Obfuscation score is currently evaluated at normal levels.
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      className="py-1 px-3 text-[10px] font-bold text-white rounded transition-colors"
                      style={{ backgroundColor: activeHex }}
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
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
