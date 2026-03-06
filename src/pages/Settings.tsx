import { ChevronRight, Globe, Bell, Palette, Info, Trash2 } from 'lucide-react'
import { useState } from 'react'

const SETTINGS_KEY = 'umbra_settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw) as { notifications: boolean; theme: 'light' | 'dark' }
  } catch { /* ignore */ }
  return { notifications: true, theme: 'light' as const }
}

function saveSettings(settings: { notifications: boolean; theme: 'light' | 'dark' }) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings)
  const [cleared, setCleared] = useState(false)

  const update = (patch: Partial<typeof settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  const handleClearData = () => {
    if (cleared) return
    localStorage.clear()
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  return (
    <div className="px-4 py-4">
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4">
          <Globe size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Language</p>
            <p className="text-xs text-[var(--color-text-secondary)]">English</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        <button type="button" onClick={() => update({ notifications: !settings.notifications })} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
          <Bell size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{settings.notifications ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${settings.notifications ? 'bg-black' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.notifications ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="h-px bg-gray-100 mx-4" />

        <button type="button" onClick={() => update({ theme: settings.theme === 'light' ? 'dark' : 'light' })} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
          <Palette size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{settings.theme === 'light' ? 'Light' : 'Dark'}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>

        <div className="h-px bg-gray-100 mx-4" />

        <div className="flex items-center gap-3 px-4 py-4">
          <Info size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">About</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Umbra PWA v1.0.0</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        <button type="button" onClick={handleClearData} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
          <Trash2 size={20} strokeWidth={1.5} className="text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-500">{cleared ? 'Data cleared!' : 'Clear Local Data'}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Remove all cached data</p>
          </div>
        </button>
      </div>
    </div>
  )
}
