import { ClipboardPaste, ScanFace } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import BottomSheet from '../BottomSheet'
import PinGrid, { PIN_LENGTH } from '../PinGrid'

type ImportStep = 'input' | 'biometric' | 'pin'
type ImportMode = 'mnemonic' | 'privateKey'

interface ImportWalletSheetProps {
  open: boolean
  onClose: () => void
  isLoading: boolean

  biometricError: string | null
  onStartBiometric: (value: string, mode: ImportMode) => void
  importWalletFromMnemonic: (mnemonic: string, pin: string) => Promise<void>
  importWalletFromKey: (key: string, pin: string) => Promise<void>
  importStep: ImportStep
  setImportStep: (step: ImportStep) => void
}

export default function ImportWalletSheet({
  open, onClose, isLoading, biometricError,
  onStartBiometric, importWalletFromMnemonic, importWalletFromKey,
  importStep, setImportStep,
}: ImportWalletSheetProps) {
  const [mode, setMode] = useState<ImportMode>('mnemonic')
  const [value, setValue] = useState('')
  const [pin, setPin] = useState('')
  const submitting = useRef(false)

  const handlePinChange = useCallback(async (v: string) => {
    setPin(v)
    if (v.length === PIN_LENGTH && !submitting.current) {
      const trimmed = value.trim()
      if (!trimmed) return
      submitting.current = true
      if (mode === 'mnemonic') {
        await importWalletFromMnemonic(trimmed, v)
      } else {
        await importWalletFromKey(trimmed, v)
      }
      setValue('')
      setPin('')
      setImportStep('input')
      onClose()
      submitting.current = false
    }
  }, [value, mode, importWalletFromMnemonic, importWalletFromKey, setImportStep, onClose])

  const close = () => {
    onClose()
    setImportStep('input')
    setValue('')
    setPin('')
  }

  return (
    <BottomSheet open={open} onClose={close}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Import Wallet</h3>
        <button type="button" onClick={close} className="text-[var(--color-text-secondary)] text-sm">
          Cancel
        </button>
      </div>

      {importStep === 'input' && (
        <>
          <div className="flex rounded-lg bg-gray-100 p-0.5 mb-4">
            <button
              type="button"
              onClick={() => { setMode('mnemonic'); setValue('') }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'mnemonic' ? 'bg-white shadow-sm' : ''}`}
            >
              Recovery Phrase
            </button>
            <button
              type="button"
              onClick={() => { setMode('privateKey'); setValue('') }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'privateKey' ? 'bg-white shadow-sm' : ''}`}
            >
              Private Key
            </button>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            {mode === 'mnemonic'
              ? 'Enter your 12-word recovery phrase separated by spaces.'
              : 'Paste your Solana private key (base58 encoded).'}
          </p>
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === 'mnemonic' ? 'word1 word2 word3 ...' : 'Private key...'}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm font-mono-accent resize-none focus:outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText()
                  if (text) setValue(text.trim())
                } catch { /* clipboard denied */ }
              }}
              className="absolute right-2.5 top-2.5 tap-feedback p-1 rounded-md hover:bg-black/5 text-gray-400"
            >
              <ClipboardPaste size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onStartBiometric(value, mode)}
            disabled={!value.trim()}
            className="tap-feedback w-full mt-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <ScanFace size={16} />
            Continue
          </button>
          {biometricError && (
            <p className="text-xs text-red-500 mt-2 text-center">{biometricError}</p>
          )}
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
          <PinGrid value={pin} onChange={handlePinChange} autoFocus disabled={isLoading} />
          {isLoading && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Importing...</p>
          )}
        </>
      )}
    </BottomSheet>
  )
}

export type { ImportStep }
