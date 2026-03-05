import {
  Camera,
  ChevronRight,
  Bot,
  Clock,
  Copy,
  Eye,
  Heart,
  Key,
  Lock,
  LogOut,
  MapPin,
  Package,
  Plus,
  ScanFace,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tag,
  Unlock,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { isBiometricSupported } from '../services/walletCrypto'
import { useStore } from '../store/useStore'

type ImportMode = 'mnemonic' | 'privateKey'
type CreateStep = 'biometric' | 'pin-set' | 'pin-confirm'
type ImportStep = 'input' | 'biometric' | 'pin'
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
    getDecryptedMnemonic,
    verifyBiometric,
  } = useWallet()

  // --- Create flow state ---
  const [createStep, setCreateStep] = useState<CreateStep | null>(null)
  const [createPin, setCreatePin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMismatch, setPinMismatch] = useState(false)

  // --- Unlock state ---
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlockPin, setUnlockPin] = useState('')

  // --- Import flow state ---
  const [showImport, setShowImport] = useState(false)
  const [importStep, setImportStep] = useState<ImportStep>('input')
  const [importMode, setImportMode] = useState<ImportMode>('mnemonic')
  const [importValue, setImportValue] = useState('')
  const [importPin, setImportPin] = useState('')

  // --- Mnemonic display ---
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonicCopied, setMnemonicCopied] = useState(false)

  // --- Settings: view mnemonic ---
  const [showViewMnemonic, setShowViewMnemonic] = useState(false)
  const [viewMnemonicPin, setViewMnemonicPin] = useState('')
  const [savedMnemonic, setSavedMnemonic] = useState<string | null>(null)
  const [viewMnemonicCopied, setViewMnemonicCopied] = useState(false)

  // --- Biometric error ---
  const [biometricError, setBiometricError] = useState<string | null>(null)

  const keyboardOffset = useKeyboardOffset()
  const setBottomNavHidden = useStore((s) => s.setBottomNavHidden)

  const dialogOpen = !!createStep || showUnlock || showImport || showMnemonic || showViewMnemonic
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

  // --- Create flow handlers ---
  const startCreate = async () => {
    setBiometricError(null)
    if (isBiometricSupported()) {
      setCreateStep('biometric')
      try {
        await verifyBiometric()
        setCreateStep('pin-set')
      } catch (e) {
        setBiometricError((e as Error).message || 'Biometric verification failed.')
        setCreateStep(null)
      }
    } else {
      // No biometric available (dev over IP, etc.) — go straight to PIN
      setCreateStep('pin-set')
    }
  }

  const handleCreatePinSet = useCallback((v: string) => {
    setCreatePin(v)
    setPinMismatch(false)
    if (v.length === PIN_LENGTH) {
      setTimeout(() => setCreateStep('pin-confirm'), 150)
    }
  }, [])

  const createSubmitting = useRef(false)
  const handleCreatePinConfirm = useCallback(async (v: string) => {
    setConfirmPin(v)
    if (v.length === PIN_LENGTH && !createSubmitting.current) {
      if (v !== createPin) {
        setPinMismatch(true)
        setConfirmPin('')
        return
      }
      createSubmitting.current = true
      await createWallet(v)
      setCreatePin('')
      setConfirmPin('')
      setCreateStep(null)
      createSubmitting.current = false
    }
  }, [createPin, createWallet])

  const closeCreate = () => {
    setCreateStep(null)
    setCreatePin('')
    setConfirmPin('')
    setPinMismatch(false)
    setBiometricError(null)
  }

  // --- Unlock handler ---
  const unlockSubmitting = useRef(false)
  const handleUnlockPin = useCallback(async (v: string) => {
    setUnlockPin(v)
    if (v.length === PIN_LENGTH && !unlockSubmitting.current) {
      unlockSubmitting.current = true
      await unlock(v)
      setUnlockPin('')
      setShowUnlock(false)
      unlockSubmitting.current = false
    }
  }, [unlock])

  // --- Import flow handlers ---
  const startImportBiometric = async () => {
    if (!importValue.trim()) return
    setBiometricError(null)
    if (isBiometricSupported()) {
      setImportStep('biometric')
      try {
        await verifyBiometric()
        setImportStep('pin')
      } catch (e) {
        setBiometricError((e as Error).message || 'Biometric verification failed.')
        setImportStep('input')
      }
    } else {
      setImportStep('pin')
    }
  }

  const importSubmitting = useRef(false)
  const handleImportPinChange = useCallback(async (v: string) => {
    setImportPin(v)
    if (v.length === PIN_LENGTH && !importSubmitting.current) {
      const trimmed = importValue.trim()
      if (!trimmed) return
      importSubmitting.current = true
      if (importMode === 'mnemonic') {
        await importWalletFromMnemonic(trimmed, v)
      } else {
        await importWalletFromKey(trimmed, v)
      }
      setImportValue('')
      setImportPin('')
      setImportStep('input')
      setShowImport(false)
      importSubmitting.current = false
    }
  }, [importValue, importMode, importWalletFromMnemonic, importWalletFromKey])

  const closeImport = () => {
    setShowImport(false)
    setImportStep('input')
    setImportValue('')
    setImportPin('')
    setBiometricError(null)
  }

  // --- Mnemonic display ---
  const handleMnemonicAck = () => {
    acknowledgeMnemonic()
    setShowMnemonic(false)
  }

  const copyMnemonic = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  // --- View saved mnemonic ---
  const viewMnemonicSubmitting = useRef(false)
  const handleViewMnemonicPin = useCallback(async (v: string) => {
    setViewMnemonicPin(v)
    if (v.length === PIN_LENGTH && !viewMnemonicSubmitting.current) {
      viewMnemonicSubmitting.current = true
      try {
        const mnemonic = await getDecryptedMnemonic(v)
        if (mnemonic) {
          setSavedMnemonic(mnemonic)
        }
      } catch {
        // wrong pin — error handled by store
      }
      setViewMnemonicPin('')
      viewMnemonicSubmitting.current = false
    }
  }, [getDecryptedMnemonic])

  const closeViewMnemonic = () => {
    setShowViewMnemonic(false)
    setViewMnemonicPin('')
    setSavedMnemonic(null)
    setViewMnemonicCopied(false)
  }

  // --- Menu items ---
  const menuItems = [
    { icon: MapPin, label: 'My Address', desc: 'Manage your shipping addresses' },
    { icon: Package, label: 'My Listings', desc: 'Manage your published items' },
    { icon: Store, label: 'My Space', desc: 'Your public storefront for buyers' },
    { icon: Tag, label: 'My Sales', desc: 'Items you have sold' },
    { icon: ShoppingBag, label: 'My Purchases', desc: 'Items you have bought' },
    { icon: Clock, label: 'Browsing History', desc: 'Recently viewed items' },
    { icon: Heart, label: 'My Favorites', desc: 'Items you have saved' },
    { icon: Users, label: 'Followed Stores', desc: 'Stores you are following' },
    ...(connected && unlocked
      ? [{ icon: Eye, label: 'Recovery Phrase', desc: 'View your backup words', action: () => setShowViewMnemonic(true) }]
      : []),
  ]

  return (
    <div className="-mx-1.5 -mt-[calc(env(safe-area-inset-top,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] bg-[var(--color-bg)]">
      <div className="relative pt-6 pb-5 flex flex-col items-center text-center bg-[var(--color-bg)]">
        {/* Top-left Settings & Top-right AI Support */}
        <button type="button" className="absolute top-4 left-4 tap-feedback p-1.5 rounded-full hover:bg-black/5 transition-colors">
          <Settings size={22} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
        </button>
        <button type="button" className="absolute top-4 right-4 tap-feedback p-1.5 rounded-full hover:bg-black/5 transition-colors">
          <Bot size={22} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
        </button>
        {/* Avatar */}
        <div className="relative mb-3">
          <div
            className="rounded-full bg-gray-700 flex items-center justify-center"
            style={{ width: 72, height: 72 }}
          >
            <span className="text-2xl font-mono-accent font-bold text-gray-300">
              {connected ? publicKey?.slice(0, 2) : '--'}
            </span>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            <Camera size={12} className="text-gray-500" />
          </button>
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
                  onClick={() => setShowUnlock(true)}
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
                  onClick={startCreate}
                  disabled={isLoading || !!createStep}
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

        {(error || biometricError) && (
          <p className="text-xs text-red-500 mt-2">{biometricError || error}</p>
        )}
      </div>

      {/* ============ Create flow sheet ============ */}
      {createStep && createStep !== 'biometric' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={closeCreate}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-black" />
              <div className={`w-2 h-2 rounded-full ${createStep === 'pin-confirm' ? 'bg-black' : 'bg-gray-200'}`} />
            </div>

            {createStep === 'pin-set' && (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield size={18} className="text-gray-600" />
                  <h3 className="text-base font-semibold">Set a PIN</h3>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
                  Choose a 6-digit PIN to protect your wallet.
                </p>
                <PinGrid value={createPin} onChange={handleCreatePinSet} autoFocus disabled={isLoading} />
              </>
            )}

            {createStep === 'pin-confirm' && (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield size={18} className="text-gray-600" />
                  <h3 className="text-base font-semibold">Confirm PIN</h3>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
                  Enter your PIN again to confirm.
                </p>
                <PinGrid value={confirmPin} onChange={handleCreatePinConfirm} autoFocus disabled={isLoading} />
                {pinMismatch && (
                  <p className="text-xs text-red-500 mt-3 text-center">PINs don't match. Try again.</p>
                )}
              </>
            )}

            {isLoading && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Creating wallet...</p>
            )}
          </div>
        </div>
      )}

      {/* ============ Unlock sheet ============ */}
      {showUnlock && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={() => { setShowUnlock(false); setUnlockPin('') }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2 text-center">Enter PIN</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
              Enter your PIN to unlock your wallet.
            </p>
            <PinGrid value={unlockPin} onChange={handleUnlockPin} autoFocus disabled={isLoading} />
            {isLoading && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Unlocking...</p>
            )}
          </div>
        </div>
      )}

      {/* ============ Mnemonic display (after create) ============ */}
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
                <div key={i} className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{i + 1}</span>
                  <p className="text-sm font-mono-accent font-medium">{word}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => copyMnemonic(pendingMnemonic, setMnemonicCopied)}
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

      {/* ============ Import sheet ============ */}
      {showImport && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={closeImport}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Import Wallet</h3>
              <button type="button" onClick={closeImport} className="text-[var(--color-text-secondary)] text-sm">
                Cancel
              </button>
            </div>

            {importStep === 'input' && (
              <>
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
                <button
                  type="button"
                  onClick={startImportBiometric}
                  disabled={!importValue.trim()}
                  className="tap-feedback w-full mt-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <ScanFace size={16} />
                  Continue
                </button>
              </>
            )}

            {importStep === 'biometric' && (
              <div className="flex flex-col items-center py-8">
                <ScanFace size={48} className="text-gray-400 mb-3 animate-pulse" />
                <p className="text-sm text-[var(--color-text-secondary)]">Verifying identity...</p>
              </div>
            )}

            {importStep === 'pin' && (
              <>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3 text-center">Set a 6-digit PIN to protect your wallet.</p>
                <PinGrid
                  value={importPin}
                  onChange={handleImportPinChange}
                  autoFocus
                  disabled={isLoading}
                />
                {isLoading && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Importing...</p>
                )}
              </>
            )}

            {biometricError && importStep === 'input' && (
              <p className="text-xs text-red-500 mt-2 text-center">{biometricError}</p>
            )}
          </div>
        </div>
      )}

      {/* ============ View saved mnemonic sheet ============ */}
      {showViewMnemonic && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ paddingBottom: keyboardOffset }}
          onClick={closeViewMnemonic}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {!savedMnemonic ? (
              <>
                <h3 className="text-base font-semibold mb-2 text-center">View Recovery Phrase</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
                  Enter your PIN to reveal your recovery phrase.
                </p>
                <PinGrid value={viewMnemonicPin} onChange={handleViewMnemonicPin} autoFocus />
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold mb-2">Your Recovery Phrase</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                  Keep these words secret and safe. Anyone with this phrase can access your wallet.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {savedMnemonic.split(' ').map((word, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{i + 1}</span>
                      <p className="text-sm font-mono-accent font-medium">{word}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => copyMnemonic(savedMnemonic, setViewMnemonicCopied)}
                  className="tap-feedback w-full py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-center gap-2 mb-2"
                >
                  <Copy size={14} />
                  {viewMnemonicCopied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button
                  type="button"
                  onClick={closeViewMnemonic}
                  className="tap-feedback w-full py-2.5 rounded-lg bg-black text-white text-sm font-medium"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats + Menu container */}
      <div className="relative mt-4 bg-white rounded-t-2xl after:absolute after:left-0 after:right-0 after:top-full after:h-screen after:bg-white">
        {/* Stats */}
        <div className="flex items-center justify-center py-4">
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold font-mono-accent">{listings}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Deals</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold font-mono-accent">—</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Rating</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold font-mono-accent">{connected ? '<1y' : '—'}</p>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Account Age</p>
          </div>
        </div>

        {/* Menu items */}
        {menuItems.map(({ icon: Icon, label, desc, action }) => (
          <div key={label}>
            <div className="h-px bg-gray-100 mx-4" />
            <button
              type="button"
              onClick={action}
              className="tap-feedback w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <Icon size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
