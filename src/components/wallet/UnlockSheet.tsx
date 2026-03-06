import { useCallback, useRef, useState } from 'react'
import BottomSheet from '../BottomSheet'
import PinGrid, { PIN_LENGTH } from '../PinGrid'

interface UnlockSheetProps {
  open: boolean
  onClose: () => void
  isLoading: boolean

  unlock: (pin: string) => Promise<void>
}

export default function UnlockSheet({ open, onClose, isLoading, unlock }: UnlockSheetProps) {
  const [pin, setPin] = useState('')
  const submitting = useRef(false)

  const handlePin = useCallback(async (v: string) => {
    setPin(v)
    if (v.length === PIN_LENGTH && !submitting.current) {
      submitting.current = true
      await unlock(v)
      setPin('')
      onClose()
      submitting.current = false
    }
  }, [unlock, onClose])

  const close = () => {
    onClose()
    setPin('')
  }

  return (
    <BottomSheet open={open} onClose={close}>
      <h3 className="text-base font-semibold mb-2 text-center">Enter PIN</h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
        Enter your PIN to unlock your wallet.
      </p>
      <PinGrid value={pin} onChange={handlePin} autoFocus disabled={isLoading} />
      {isLoading && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Unlocking...</p>
      )}


    </BottomSheet>
  )
}
