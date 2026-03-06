import { Shield } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import BottomSheet from '../BottomSheet'
import PinGrid, { PIN_LENGTH } from '../PinGrid'

type CreateStep = 'biometric' | 'pin-set' | 'pin-confirm'

interface CreateWalletSheetProps {
  step: CreateStep | null
  setStep: (step: CreateStep | null) => void
  isLoading: boolean

  createWallet: (pin: string) => Promise<void>
}

export default function CreateWalletSheet({ step, setStep, isLoading, createWallet }: CreateWalletSheetProps) {
  const [createPin, setCreatePin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMismatch, setPinMismatch] = useState(false)
  const createSubmitting = useRef(false)

  const handlePinSet = useCallback((v: string) => {
    setCreatePin(v)
    setPinMismatch(false)
    if (v.length === PIN_LENGTH) {
      setTimeout(() => setStep('pin-confirm'), 150)
    }
  }, [setStep])

  const handlePinConfirm = useCallback(async (v: string) => {
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
      setStep(null)
      createSubmitting.current = false
    }
  }, [createPin, createWallet, setStep])

  const close = () => {
    setStep(null)
    setCreatePin('')
    setConfirmPin('')
    setPinMismatch(false)
  }

  return (
    <BottomSheet open={!!step && step !== 'biometric'} onClose={close}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-black" />
        <div className={`w-2 h-2 rounded-full ${step === 'pin-confirm' ? 'bg-black' : 'bg-gray-200'}`} />
      </div>

      {step === 'pin-set' && (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={18} className="text-gray-600" />
            <h3 className="text-base font-semibold">Set a PIN</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
            Choose a 6-digit PIN to protect your wallet.
          </p>
          <PinGrid value={createPin} onChange={handlePinSet} autoFocus disabled={isLoading} />
        </>
      )}

      {step === 'pin-confirm' && (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={18} className="text-gray-600" />
            <h3 className="text-base font-semibold">Confirm PIN</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
            Enter your PIN again to confirm.
          </p>
          <PinGrid value={confirmPin} onChange={handlePinConfirm} autoFocus disabled={isLoading} />
          {pinMismatch && (
            <p className="text-xs text-red-500 mt-3 text-center">PINs don't match. Try again.</p>
          )}
        </>
      )}

      {isLoading && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">Creating wallet...</p>
      )}


    </BottomSheet>
  )
}

export type { CreateStep }
