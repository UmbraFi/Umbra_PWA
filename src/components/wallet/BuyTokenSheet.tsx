import { useState } from 'react'
import BottomSheet from '../BottomSheet'

const TOKENS = ['SOL', 'USDT', 'USDC', 'EURC'] as const
type PayToken = (typeof TOKENS)[number]

const RATES: Record<PayToken, number> = {
  SOL: 100,
  USDT: 0.65,
  USDC: 0.65,
  EURC: 0.60,
}

interface BuyTokenSheetProps {
  open: boolean
  onClose: () => void
}

export default function BuyTokenSheet({ open, onClose }: BuyTokenSheetProps) {
  const [selected, setSelected] = useState<PayToken>('SOL')
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  const numAmount = Number(amount) || 0
  const estimated = numAmount * RATES[selected]

  const handleBuy = () => {
    if (numAmount <= 0) return
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      onClose()
    }, 1500)
  }

  const handleClose = () => {
    setAmount('')
    setSuccess(false)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <h3 className="text-base font-semibold mb-4 text-center">Buy UMBRA</h3>

      {/* Token selector */}
      <div className="flex gap-2 mb-4">
        {TOKENS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelected(t)}
            className={`tap-feedback flex-1 py-2 rounded-full text-xs font-medium transition-colors ${
              selected === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Amount ({selected})</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Rate & estimate */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4 text-xs text-[var(--color-text-secondary)] space-y-1">
        <p>Rate: 1 {selected} = {RATES[selected]} UMBRA</p>
        <p className="font-medium text-black">
          You receive: {estimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} UMBRA
        </p>
      </div>

      {/* Buy button / success */}
      {success ? (
        <div className="py-3 rounded-xl bg-green-500 text-white text-sm font-medium text-center">
          Purchase successful!
        </div>
      ) : (
        <button
          type="button"
          onClick={handleBuy}
          disabled={numAmount <= 0}
          className="tap-feedback w-full py-3 rounded-xl bg-[var(--color-accent)] text-black text-sm font-medium disabled:opacity-40"
        >
          Buy UMBRA
        </button>
      )}
    </BottomSheet>
  )
}
