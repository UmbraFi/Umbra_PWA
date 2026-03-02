import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Trophy, Gavel, FileText, Tags } from 'lucide-react'
import { useStore } from '../store/useStore'
import { APP_ROUTE_PATHS } from '../navigation/paths'

export const listingTypes = ['new', 'pool', 'auction', 'contract'] as const
export type ListingType = (typeof listingTypes)[number]

const items: { type: ListingType; label: string; icon: typeof Sparkles }[] = [
  { type: 'new', label: 'New', icon: Sparkles },
  { type: 'pool', label: 'Pool', icon: Trophy },
  { type: 'auction', label: 'Auction', icon: Gavel },
  { type: 'contract', label: 'Contract', icon: FileText },
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
    onChange(
      selected.includes(type)
        ? selected.filter((t) => t !== type)
        : [...selected, type],
    )
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1 flex gap-2">
        {items.map(({ type, label, icon: Icon }) => {
          const active = selected.includes(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                  : 'bg-white text-[var(--color-text)] active:bg-white/10 border border-[var(--color-border)]'
              }`}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.5} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          navigate(APP_ROUTE_PATHS.feedTags, {
            state: { from: `${location.pathname}${location.search}` },
          })
        }}
        className="relative tap-feedback p-2.5 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text)] transition-colors shrink-0"
        aria-label="Open tag filters"
      >
        <Tags size={18} strokeWidth={1.8} />
        {selectedFeedTypeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[var(--color-text)] px-1 py-0.5 text-[9px] leading-none text-white">
            {selectedFeedTypeCount}
          </span>
        )}
      </button>
    </div>
  )
}
