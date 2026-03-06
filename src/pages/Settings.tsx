import { Bell, ChevronRight, DollarSign, Eye, Globe, Info, LogOut, Palette, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import BottomSheet from '../components/BottomSheet'
import { ViewMnemonicSheet } from '../components/wallet/MnemonicSheet'
import { clearScopedStorage } from '../services/storage'

const SETTINGS_KEY = 'umbra_settings'

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', label: 'Korean Won' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', label: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'SOL', symbol: 'SOL', label: 'Solana' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

interface SettingsData {
  notifications: boolean
  theme: 'light' | 'dark'
  currency: CurrencyCode
}

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { currency: 'USD', ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { notifications: true, theme: 'light', currency: 'USD' }
}

function saveSettings(settings: SettingsData) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings)
  const [cleared, setCleared] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [showViewMnemonic, setShowViewMnemonic] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  const { connected, unlocked, disconnect, getDecryptedMnemonic } = useWallet()

  const update = (patch: Partial<SettingsData>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  const handleClearData = () => {
    if (cleared) return
    try {
      clearScopedStorage()
    } catch {
      // No active wallet — fall back to clearing everything
      localStorage.clear()
    }
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency) ?? CURRENCIES[0]

  return (
    <div className="px-4 py-4">
      {/* General */}
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

        <button type="button" onClick={() => setShowCurrencyPicker(true)} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
          <DollarSign size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Display Currency</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{currentCurrency.symbol} {currentCurrency.label}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>

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
      </div>

      {/* Wallet & Security */}
      {connected && unlocked && (
        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden mt-4">
          <button type="button" onClick={() => setShowViewMnemonic(true)} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
            <Eye size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
            <div className="flex-1">
              <p className="text-sm font-medium">Recovery Phrase</p>
              <p className="text-xs text-[var(--color-text-secondary)]">View your backup words</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden mt-4">
        <button type="button" onClick={handleClearData} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
          <Trash2 size={20} strokeWidth={1.5} className="text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-500">{cleared ? 'Data cleared!' : 'Clear Local Data'}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Remove all cached data</p>
          </div>
        </button>

        {connected && (
          <>
            <div className="h-px bg-gray-100 mx-4" />
            <button type="button" onClick={() => setShowDisconnectConfirm(true)} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 text-left">
              <LogOut size={20} strokeWidth={1.5} className="text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-500">Disconnect Wallet</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Remove wallet and sign out</p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Currency picker */}
      <BottomSheet open={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)}>
        <h3 className="text-base font-semibold mb-4 text-center">Display Currency</h3>
        <div className="max-h-[50vh] overflow-y-auto -mx-1">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { update({ currency: c.code }); setShowCurrencyPicker(false) }}
              className={`tap-feedback w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${settings.currency === c.code ? 'bg-black/5' : 'hover:bg-gray-50'}`}
            >
              <span className="w-8 text-center text-base font-medium">{c.symbol}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{c.code}</p>
              </div>
              {settings.currency === c.code && (
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* View mnemonic */}
      <ViewMnemonicSheet open={showViewMnemonic} onClose={() => setShowViewMnemonic(false)} getDecryptedMnemonic={getDecryptedMnemonic} />

      {/* Disconnect confirm */}
      <BottomSheet open={showDisconnectConfirm} onClose={() => setShowDisconnectConfirm(false)}>
        <h3 className="text-base font-semibold mb-2 text-center">Disconnect Wallet?</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
          This will remove your local wallet data and cannot be undone. Make sure you have backed up your recovery phrase.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowDisconnectConfirm(false)} className="btn-outline tap-feedback flex-1 py-3 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button type="button" onClick={() => { setShowDisconnectConfirm(false); disconnect() }} className="tap-feedback flex-1 py-3 rounded-xl text-sm font-medium bg-red-500 text-white">
            Disconnect
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
