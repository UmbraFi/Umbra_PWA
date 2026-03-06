import { useCallback, useRef, useState } from 'react'
import BottomSheet from '../BottomSheet'
import MnemonicGrid from '../MnemonicGrid'
import PinGrid, { PIN_LENGTH } from '../PinGrid'

interface PendingMnemonicSheetProps {
  mnemonic: string | null
  open: boolean
  onAcknowledge: () => void
}

export function PendingMnemonicSheet({ mnemonic, open, onAcknowledge }: PendingMnemonicSheetProps) {
  if (!mnemonic) return null

  return (
    <BottomSheet open={open}>
      <h3 className="text-base font-semibold mb-2">Save Your Recovery Phrase</h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-4">
        Write down these 12 words in order. This is the only way to recover your wallet.
      </p>
      <MnemonicGrid mnemonic={mnemonic} onDone={onAcknowledge} doneLabel="I have saved my recovery phrase" />
    </BottomSheet>
  )
}

interface ViewMnemonicSheetProps {
  open: boolean
  onClose: () => void
  getDecryptedMnemonic: (pin: string) => Promise<string | null>
}

export function ViewMnemonicSheet({ open, onClose, getDecryptedMnemonic }: ViewMnemonicSheetProps) {
  const [pin, setPin] = useState('')
  const [savedMnemonic, setSavedMnemonic] = useState<string | null>(null)
  const submitting = useRef(false)

  const handlePin = useCallback(async (v: string) => {
    setPin(v)
    if (v.length === PIN_LENGTH && !submitting.current) {
      submitting.current = true
      try {
        const mnemonic = await getDecryptedMnemonic(v)
        if (mnemonic) setSavedMnemonic(mnemonic)
      } catch {
        // wrong pin — error handled by store
      }
      setPin('')
      submitting.current = false
    }
  }, [getDecryptedMnemonic])

  const close = () => {
    onClose()
    setPin('')
    setSavedMnemonic(null)
  }

  return (
    <BottomSheet open={open} onClose={close}>
      {!savedMnemonic ? (
        <>
          <h3 className="text-base font-semibold mb-2 text-center">View Recovery Phrase</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
            Enter your PIN to reveal your recovery phrase.
          </p>
          <PinGrid value={pin} onChange={handlePin} autoFocus />
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold mb-2">Your Recovery Phrase</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            Keep these words secret and safe. Anyone with this phrase can access your wallet.
          </p>
          <MnemonicGrid mnemonic={savedMnemonic} onDone={close} doneLabel="Done" />
        </>
      )}
    </BottomSheet>
  )
}
