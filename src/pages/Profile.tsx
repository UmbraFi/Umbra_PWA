import {
  Copy,
  Heart,
  Key,
  Lock,
  LogOut,
  Package,
  Plus,
  Settings,
  Unlock,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useStore } from '../store/useStore'

type ImportMode = 'mnemonic' | 'privateKey'
const PIN_LENGTH = 6

// ---------------------------------------------------------------------------
// Hook: track keyboard height via visualViewport (iOS Safari fallback)
// ---------------------------------------------------------------------------
function useKeyboardOffset() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      // The difference between layout viewport and visual viewport = keyboard
      setOffset(Math.max(0, window.innerHeight - vv.height))
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])
  return offset
}

// ---------------------------------------------------------------------------
// PIN Grid component — 6 separate boxes with hidden native input
// ---------------------------------------------------------------------------

function PinGrid({
  value,
  onChange,
  autoFocus,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleTap = () => inputRef.current?.focus()

  return (
    <div className="relative">
      {/* Hidden native input for keyboard */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={PIN_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
        disabled={disabled}
        autoFocus={autoFocus}
        className="absolute inset-0 w-full h-full opacity-0 z-10"
        autoComplete="off"
      />
      {/* Visual grid */}
      <div className="flex gap-2 justify-center" onClick={handleTap}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center transition-colors ${
              i === value.length
                ? 'border-black'
                : value[i]
                  ? 'border-gray-300'
                  : 'border-gray-200'
            }`}
          >
            {value[i] ? (
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------

export default function Profile() {
  const {
    publicKey,
    shortAddress,
    connected,
    unlocked,
    isLoading,
    error,
    pendingMnemonic,
    createWallet,
    importWalletFromMnemonic,
    importWalletFromKey,
    unlock,
    lock,
    disconnect,
    acknowledgeMnemonic,
    hasExistingWallet,
  } = useWallet()

  const [showImport, setShowImport] = useState(false)
  const [importMode, setImportMode] = useState<ImportMode>('mnemonic')
  const [importValue, setImportValue] = useState('')
  const [pin, setPin] = useState('')
  const [showPinFor, setShowPinFor] = useState<'create' | 'unlock' | null>(null)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonicCopied, setMnemonicCopied] = useState(false)
  const [importPin, setImportPin] = useState('')

  const keyboardOffset = useKeyboardOffset()
  const setBottomNavHidden = useStore((s) => s.setBottomNavHidden)

  const dialogOpen = !!showPinFor || showImport || showMnemonic
  useEffect(() => {
    setBottomNavHidden(dialogOpen)
    return () => setBottomNavHidden(false)
  }, [dialogOpen, setBottomNavHidden])

  useEffect(() => {
    if (pendingMnemonic) setShowMnemonic(true)
  }, [pendingMnemonic])

  const listings = useStore((s) =>
    connected && publicKey
      ? s.products.filter((p) => p.seller === publicKey).length
      : 0,
  )

  // Auto-submit when PIN reaches 6 digits
  const pinSubmitting = useRef(false)
  const handlePinChange = useCallback(async (v: string) => {
    setPin(v)
    if (v.length === PIN_LENGTH && !pinSubmitting.current) {
      pinSubmitting.current = true
      if (showPinFor === 'create') {
        await createWallet(v)
      } else if (showPinFor === 'unlock') {
        await unlock(v)
      }
      setPin('')
      setShowPinFor(null)
      pinSubmitting.current = false
    }
  }, [showPinFor, createWallet, unlock])

  const importPinSubmitting = useRef(false)
  const handleImportPinChange = useCallback(async (v: string) => {
    setImportPin(v)
    if (v.length === PIN_LENGTH && !importPinSubmitting.current) {
      const trimmed = importValue.trim()
      if (!trimmed) return
      importPinSubmitting.current = true
      if (importMode === 'mnemonic') {
        await importWalletFromMnemonic(trimmed, v)
      } else {
        await importWalletFromKey(trimmed, v)
      }
      setImportValue('')
      setImportPin('')
      setShowImport(false)
      importPinSubmitting.current = false
    }
  }, [importValue, importMode, importWalletFromMnemonic, importWalletFromKey])

  const handleMnemonicAck = () => {
    acknowledgeMnemonic()
    setShowMnemonic(false)
  }

  const copyMnemonic = async () => {
    if (!pendingMnemonic) return
    await navigator.clipboard.writeText(pendingMnemonic)
    setMnemonicCopied(true)
    setTimeout(() => setMnemonicCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="pt-6 pb-5 flex flex-col items-center text-center">
        {/* Avatar */}
        <div
          className="rounded-full bg-gray-100 flex items-center justify-center mb-3"
          style={{ width: 72, height: 72 }}
        >
          <span className="text-2xl font-mono-accent font-bold text-[var(--color-text-secondary)]">
            {connected ? publicKey?.slice(0, 2) : '--'}
          </span>
        </div>

        {/* Not unlocked */}
        {!unlocked && (
          <>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {hasExistingWallet ? 'Wallet locked' : 'No wallet'}
            </p>
            <div className="flex flex-col gap-2 mt-3 w-full max-w-[260px]">
              {hasExistingWallet && (
                <button
                  type="button"
                  onClick={() => setShowPinFor('unlock')}
                  disabled={isLoading}
                  className="btn-outline tap-feedback w-full py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Unlock size={16} />
                  Unlock {shortAddress}
                </button>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinFor('create')}
                  disabled={isLoading}
                  className="btn-outline tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  disabled={isLoading}
                  className="btn-outline tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Key size={16} />
                  Import
                </button>
              </div>
            </div>
          </>
        )}

        {/* Wallet unlocked */}
        {connected && unlocked && (
          <>
            <p className="text-sm font-medium font-mono-accent">{shortAddress}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Wallet unlocked</p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={lock}
                className="btn-outline tap-feedback px-5 py-2.5 rounded-lg flex items-center gap-2"
              >
                <Lock size={16} />
                Lock
              </button>
              <button
                type="button"
                onClick={disconnect}
                className="btn-outline tap-feedback px-5 py-2.5 rounded-lg flex items-center gap-2 text-red-500"
              >
                <LogOut size={16} />
                Remove
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* PIN entry sheet (create / unlock) */}
      {showPinFor && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={() => { setShowPinFor(null); setPin('') }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2 text-center">
              {showPinFor === 'unlock' ? 'Enter PIN' : 'Set a PIN'}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
              {showPinFor === 'unlock'
                ? 'Enter your PIN to unlock your wallet.'
                : 'Set a 6-digit PIN to protect your wallet.'}
            </p>
            <PinGrid value={pin} onChange={handlePinChange} autoFocus disabled={isLoading} />
            {isLoading && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Processing...</p>
            )}
          </div>
        </div>
      )}

      {/* Mnemonic display sheet */}
      {showMnemonic && pendingMnemonic && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" style={{ paddingBottom: keyboardOffset }}>
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2">Save Your Recovery Phrase</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Write down these 12 words in order. This is the only way to recover your wallet.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {pendingMnemonic.split(' ').map((word, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-gray-50 px-2 py-2 text-center"
                >
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{i + 1}</span>
                  <p className="text-sm font-mono-accent font-medium">{word}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={copyMnemonic}
              className="tap-feedback w-full py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-center gap-2 mb-2"
            >
              <Copy size={14} />
              {mnemonicCopied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button
              type="button"
              onClick={handleMnemonicAck}
              className="tap-feedback w-full py-2.5 rounded-lg bg-black text-white text-sm font-medium"
            >
              I have saved my recovery phrase
            </button>
          </div>
        </div>
      )}

      {/* Import sheet */}
      {showImport && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={() => { setShowImport(false); setImportValue(''); setImportPin('') }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Import Wallet</h3>
              <button
                type="button"
                onClick={() => { setShowImport(false); setImportValue(''); setImportPin('') }}
                className="text-[var(--color-text-secondary)] text-sm"
              >
                Cancel
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg bg-gray-100 p-0.5 mb-4">
              <button
                type="button"
                onClick={() => { setImportMode('mnemonic'); setImportValue('') }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${importMode === 'mnemonic' ? 'bg-white shadow-sm' : ''}`}
              >
                Recovery Phrase
              </button>
              <button
                type="button"
                onClick={() => { setImportMode('privateKey'); setImportValue('') }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${importMode === 'privateKey' ? 'bg-white shadow-sm' : ''}`}
              >
                Private Key
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {importMode === 'mnemonic'
                ? 'Enter your 12-word recovery phrase separated by spaces.'
                : 'Paste your Solana private key (base58 encoded).'}
            </p>
            <textarea
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder={importMode === 'mnemonic' ? 'word1 word2 word3 ...' : 'Private key...'}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono-accent resize-none focus:outline-none focus:border-gray-400"
            />

            <p className="text-xs text-[var(--color-text-secondary)] mt-4 mb-3 text-center">Set a 6-digit PIN</p>
            <PinGrid
              value={importPin}
              onChange={handleImportPinChange}
              disabled={!importValue.trim() || isLoading}
            />
            {isLoading && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Processing...</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="py-3.5 text-center rounded-xl bg-gray-50">
          <p className="text-lg font-semibold font-mono-accent">{listings}</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            Listings
          </p>
        </div>
        <div className="py-3.5 text-center rounded-xl bg-gray-50">
          <p className="text-lg font-semibold font-mono-accent">0</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            Sales
          </p>
        </div>
        <div className="py-3.5 text-center rounded-xl bg-gray-50">
          <p className="text-lg font-semibold font-mono-accent">{connected ? 1 : 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            Wallets
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="mt-5 flex flex-col gap-2">
        {[
          { icon: Package, label: 'My Listings', desc: 'Manage your items' },
          { icon: Heart, label: 'Saved Items', desc: 'Items you liked' },
          { icon: Wallet, label: 'Wallet', desc: 'View balances & transactions' },
          { icon: Settings, label: 'Settings', desc: 'Account preferences' },
        ].map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            type="button"
            className="tap-feedback w-full flex items-center gap-3 rounded-2xl bg-white px-3 py-4 shadow-[0_8px_20px_rgba(10,10,10,0.04)] hover:bg-gray-50 transition-colors text-left"
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className="text-[var(--color-text-secondary)]"
            />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
