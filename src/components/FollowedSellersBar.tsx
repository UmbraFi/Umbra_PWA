import { memo, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { getSellerAvatarColor, getSellerAvatarLabel } from '../utils/sellerAvatar'

const FollowedSellersBar = memo(function FollowedSellersBar() {
  const followedSellers = useStore((s) => s.followedSellers)
  const selectedSellers = useStore((s) => s.selectedFollowedSellers)
  const toggleSeller = useStore((s) => s.toggleSelectedFollowedSeller)
  const clearSelection = useStore((s) => s.clearSelectedFollowedSellers)

  const selectedSet = useMemo(() => new Set(selectedSellers), [selectedSellers])

  if (followedSellers.length === 0) return null

  return (
    <div className="pt-2 pb-0.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">Followed sellers</p>
        {selectedSellers.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto p-1 [-webkit-overflow-scrolling:touch]">
        {followedSellers.map((seller) => {
          const isSelected = selectedSet.has(seller)
          return (
            <button
              key={seller}
              type="button"
              title={seller}
              aria-label={`Filter updates by ${seller}`}
              aria-pressed={isSelected}
              onClick={() => toggleSeller(seller)}
              className="tap-feedback shrink-0"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-all ${
                  isSelected
                    ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]'
                    : ''
                }`}
                style={{ backgroundColor: getSellerAvatarColor(seller) }}
              >
                <span className="text-[11px] font-semibold tracking-wide text-white">
                  {getSellerAvatarLabel(seller)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})

export default FollowedSellersBar
