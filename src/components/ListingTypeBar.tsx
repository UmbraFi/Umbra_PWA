import { useLocation, useNavigate } from 'react-router-dom'
import { Tags } from 'lucide-react'
import { useStore } from '../store/useStore'
import { APP_ROUTE_PATHS } from '../navigation/paths'

export const listingTypes = ['picks', 'new', 'hot', 'basic', 'bid', 'win'] as const
export type ListingType = (typeof listingTypes)[number]

const items: { type: ListingType; label: string }[] = [
  { type: 'picks', label: 'Picks' },
  { type: 'new', label: 'New' },
  { type: 'hot', label: 'Hot' },
  { type: 'basic', label: 'Basic' },
  { type: 'bid', label: 'Bid' },
  { type: 'win', label: 'Win' },
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
    if (type === 'picks') {
      // Picks = show all, clear other selections
      onChange(['picks'])
    } else {
      // Remove 'picks' when selecting a specific type
      const without = selected.filter((t) => t !== type && t !== 'picks')
      if (selected.includes(type)) {
        // Deselecting — if nothing left, go back to picks
        onChange(without.length === 0 ? ['picks'] : without)
      } else {
        onChange([...without, type])
      }
    }
  }

  return (
    <div className="relative flex items-center pt-2">
      {/* Scrollable tags area */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pl-2 pr-10">
        {items.map(({ type, label }, i) => {
          const active = selected.includes(type)
          return (
            <span key={type} className="flex items-center gap-4 shrink-0">
              {i > 0 && (
                <span className="w-px h-3.5 bg-[var(--color-border)] shrink-0" />
              )}
              <button
                type="button"
                onClick={() => toggle(type)}
                className={`relative pb-2 text-[15px] tracking-wide transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#a8cc33] font-bold'
                    : 'text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-text)]'
                }`}
              >
                {/* Invisible bold text to reserve width and prevent layout shift */}
                <span className="invisible font-bold" aria-hidden="true">{label}</span>
                <span className="absolute inset-0 flex items-center justify-center pb-2">{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-[#a8cc33]" />
                )}
              </button>
            </span>
          )
        })}
      </div>

      {/* Fade gradient + fixed Tags icon on the right */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
        <div className="w-16 h-full bg-gradient-to-l from-[var(--color-bg)] from-40% to-transparent" />
      </div>
      <button
        type="button"
        onClick={() => {
          navigate(APP_ROUTE_PATHS.feedTags, {
            state: { from: `${location.pathname}${location.search}` },
          })
        }}
        className="absolute right-0 top-0 bottom-0 flex items-center tap-feedback pl-2 pr-1.5 text-[var(--color-text)] transition-colors"
        aria-label="Open tag filters"
      >
        <div className="relative">
          <Tags size={18} strokeWidth={1.8} />
          {selectedFeedTypeCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-text)] px-1 py-0.5 text-[9px] leading-none text-white">
              {selectedFeedTypeCount}
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
