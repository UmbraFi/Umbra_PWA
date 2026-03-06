import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

interface StackHeaderProps {
  title: string
  onBack: () => void
  backLabel?: string
  bleed?: boolean
  rightSlot?: ReactNode
}

export default function StackHeader({
  title,
  onBack,
  backLabel = 'Go back',
  bleed = false,
  rightSlot,
}: StackHeaderProps) {
  return (
    <nav
      className={`${bleed ? '-mx-2' : ''} sticky top-0 z-50 bg-[var(--color-bg)]`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-1.5 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          data-edge-gesture-exempt="true"
          className="tap-feedback touch-manipulation p-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label={backLabel}
        >
          <ChevronLeft size={20} strokeWidth={1.8} className="text-black" />
        </button>

        <span className="text-sm font-semibold text-center truncate">{title}</span>

        {rightSlot ? <div className="min-w-[32px] flex justify-end">{rightSlot}</div> : <div className="w-[32px]" aria-hidden="true" />}
      </div>
    </nav>
  )
}
