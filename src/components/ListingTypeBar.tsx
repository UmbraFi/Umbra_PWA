import { useLocation, useNavigate } from 'react-router-dom'
import { Tags } from 'lucide-react'
import { useStore } from '../store/useStore'
import { APP_ROUTE_PATHS } from '../navigation/paths'

export const listingTypes = ['new', 'pool', 'auction', 'contract'] as const
export type ListingType = (typeof listingTypes)[number]

const items: { type: ListingType; label: string }[] = [
  { type: 'new', label: 'New' },
  { type: 'pool', label: 'Pool' },
  { type: 'auction', label: 'Auction' },
  { type: 'contract', label: 'Contract' },
]

interface Props {
  selected: ListingType[]
  onChange: (types: ListingType[]) => void
}

export default function ListingTypeBar({ selected, onChange }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedFeedTypeCount = useStore((s) => s.selectedFeedTypes.length)

  const toggle = (type: ListingType) => {
    if (navigator.vibrate) navigator.vibrate(8)
    onChange(
      selected.includes(type)
        ? selected.filter((t) => t !== type)
        : [...selected, type],
    )
  }

  return (
    <div className="flex items-center gap-4 py-0.5">
      {items.map(({ type, label }, i) => {
        const active = selected.includes(type)
        return (
          <span key={type} className="flex items-center gap-4">
            {i > 0 && (
              <span className="w-px h-3.5 bg-[var(--color-border)] shrink-0" />
            )}
            <button
              type="button"
              onClick={() => toggle(type)}
              style={{ fontWeight: active ? 700 : 500 }}
              className={`py-2 text-[15px] tracking-wide transition-colors ${
                active
                  ? 'text-[var(--color-text)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {label}
            </button>
          </span>
        )
      })}
      <span className="flex-1" />

      <button
        type="button"
        onClick={() => {
          navigate(APP_ROUTE_PATHS.feedTags, {
            state: { from: `${location.pathname}${location.search}` },
          })
        }}
        className="relative tap-feedback p-1 text-[var(--color-text)] transition-colors shrink-0"
        aria-label="Open tag filters"
      >
        <Tags size={18} strokeWidth={1.8} />
        {selectedFeedTypeCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-text)] px-1 py-0.5 text-[9px] leading-none text-white">
            {selectedFeedTypeCount}
          </span>
        )}
      </button>
    </div>
  )
}
