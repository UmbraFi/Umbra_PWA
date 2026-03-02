import {
  Dumbbell,
  Flame,
  Gamepad2,
  Gem,
  House,
  Palette,
  Shirt,
  Smartphone,
  Sparkles,
  Wine,
  X,
  type LucideIcon,
} from 'lucide-react'
import { feedTypes, feedTypeLabels, type FeedType } from '../data/mockProducts'
import { useSafeBack } from '../hooks/useSafeBack'
import { useStore } from '../store/useStore'
import { APP_ROUTE_PATHS } from '../navigation/paths'

interface TagMeta {
  icon: LucideIcon
  iconClass: string
  accentBorderClass: string
  group: 'tech' | 'fashion' | 'lifestyle' | 'consumables'
}

const tagMetaByType: Record<FeedType, TagMeta> = {
  electronics: {
    icon: Smartphone,
    iconClass: 'text-sky-700',
    accentBorderClass: 'border-sky-500',
    group: 'tech',
  },
  womensFashion: {
    icon: Sparkles,
    iconClass: 'text-pink-700',
    accentBorderClass: 'border-pink-500',
    group: 'fashion',
  },
  mensFashion: {
    icon: Shirt,
    iconClass: 'text-indigo-700',
    accentBorderClass: 'border-indigo-500',
    group: 'fashion',
  },
  beverages: {
    icon: Wine,
    iconClass: 'text-amber-700',
    accentBorderClass: 'border-amber-500',
    group: 'consumables',
  },
  tobacco: {
    icon: Flame,
    iconClass: 'text-stone-700',
    accentBorderClass: 'border-stone-500',
    group: 'consumables',
  },
  beauty: {
    icon: Palette,
    iconClass: 'text-rose-700',
    accentBorderClass: 'border-rose-500',
    group: 'fashion',
  },
  sports: {
    icon: Dumbbell,
    iconClass: 'text-emerald-700',
    accentBorderClass: 'border-emerald-500',
    group: 'lifestyle',
  },
  gaming: {
    icon: Gamepad2,
    iconClass: 'text-violet-700',
    accentBorderClass: 'border-violet-500',
    group: 'tech',
  },
  homeLiving: {
    icon: House,
    iconClass: 'text-cyan-700',
    accentBorderClass: 'border-cyan-500',
    group: 'lifestyle',
  },
  collectibles: {
    icon: Gem,
    iconClass: 'text-yellow-700',
    accentBorderClass: 'border-yellow-500',
    group: 'lifestyle',
  },
}

const toOrderedSelection = (selection: FeedType[]) =>
  feedTypes.filter((feedType) => selection.includes(feedType))

const tagGroups = [
  { key: 'tech', label: 'Tech & Digital' },
  { key: 'fashion', label: 'Fashion & Beauty' },
  { key: 'lifestyle', label: 'Lifestyle & Home' },
  { key: 'consumables', label: 'Consumables' },
] as const

export default function FeedTagFilters() {
  const selectedFeedTypes = useStore((s) => s.selectedFeedTypes)
  const setSelectedFeedTypes = useStore((s) => s.setSelectedFeedTypes)
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)
  const isFeedTypeSelected = (feedType: FeedType) =>
    selectedFeedTypes.length === 0 || selectedFeedTypes.includes(feedType)

  const toggleFeedType = (feedType: FeedType) => {
    if (selectedFeedTypes.length === 0) {
      setSelectedFeedTypes(feedTypes.filter((item) => item !== feedType))
      return
    }

    const nextSelection = selectedFeedTypes.includes(feedType)
      ? selectedFeedTypes.filter((item) => item !== feedType)
      : [...selectedFeedTypes, feedType]

    if (nextSelection.length === 0 || nextSelection.length === feedTypes.length) {
      setSelectedFeedTypes([])
      return
    }

    setSelectedFeedTypes(toOrderedSelection(nextSelection))
  }

  return (
    <div className="max-w-3xl mx-auto py-2 pb-8">
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-[var(--color-bg)]/95 py-1 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setSelectedFeedTypes([])}
          className="tap-feedback rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={goBack}
          className="tap-feedback rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Close tag filters"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-5">
        {tagGroups.map((group) => {
          const items = feedTypes.filter((feedType) => tagMetaByType[feedType].group === group.key)
          if (items.length === 0) {
            return null
          }

          return (
            <section key={group.key}>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                {group.label}
              </h2>

              <div className="flex flex-wrap gap-2">
                {items.map((feedType) => {
                  const meta = tagMetaByType[feedType]
                  const Icon = meta.icon
                  const isSelected = isFeedTypeSelected(feedType)

                  return (
                    <button
                      key={feedType}
                      type="button"
                      onClick={() => toggleFeedType(feedType)}
                      aria-pressed={isSelected}
                      className={`tap-feedback inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors ${
                        isSelected
                          ? `${meta.accentBorderClass} bg-white`
                          : 'border-gray-200 bg-gray-100'
                      }`}
                    >
                      <Icon
                        size={13}
                        strokeWidth={2.25}
                        className={isSelected ? meta.iconClass : 'text-gray-500'}
                      />
                      <span className="whitespace-nowrap">{feedTypeLabels[feedType]}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
