import { memo, useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const parsePriceInput = (value: string): number | null => {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

interface DiscoverControlsProps {
  className?: string
}

const inputClass =
  'w-0 flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-[var(--color-border)] focus:border-[var(--color-text)] focus:outline-none transition-colors placeholder:text-[var(--color-text-secondary)]'

const DiscoverControls = memo(function DiscoverControls({
  className,
}: DiscoverControlsProps) {
  const { minPrice, maxPrice, setPriceRange } = useStore()

  const [priceDraft, setPriceDraft] = useState({
    min: minPrice?.toString() ?? '',
    max: maxPrice?.toString() ?? '',
  })

  useEffect(() => {
    setPriceDraft({
      min: minPrice?.toString() ?? '',
      max: maxPrice?.toString() ?? '',
    })
  }, [minPrice, maxPrice])

  const handleBlur = () => {
    setPriceRange(parsePriceInput(priceDraft.min), parsePriceInput(priceDraft.max))
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] shrink-0">
          Price (SOL)
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={priceDraft.min}
          onChange={(e) => setPriceDraft((prev) => ({ ...prev, min: e.target.value }))}
          onBlur={handleBlur}
          className={inputClass}
          placeholder="Min"
        />
        <span className="text-[10px] text-[var(--color-text-secondary)]">–</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={priceDraft.max}
          onChange={(e) => setPriceDraft((prev) => ({ ...prev, max: e.target.value }))}
          onBlur={handleBlur}
          className={inputClass}
          placeholder="Max"
        />
      </div>
    </div>
  )
})

export default DiscoverControls
