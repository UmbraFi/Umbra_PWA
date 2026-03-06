import { useMemo } from 'react'
import {
  Check,
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

type TagGroupKey = 'tech' | 'fashion' | 'lifestyle' | 'consumables'

interface TagMeta {
  icon: LucideIcon
  description: string
  iconClass: string
  iconWrapClass: string
  activeCardClass: string
  group: TagGroupKey
}

interface TagPreset {
  key: string
  label: string
  description: string
  icon: LucideIcon
  feedTypes: FeedType[]
  iconWrapClass: string
  activeCardClass: string
}

const tagMetaByType: Record<FeedType, TagMeta> = {
  electronics: {
    icon: Smartphone,
    description: 'Phones, audio, desktops and smart gadgets.',
    iconClass: 'text-sky-700',
    iconWrapClass: 'bg-sky-100 text-sky-700',
    activeCardClass: 'border-sky-200 bg-sky-50/90 shadow-[0_14px_36px_rgba(14,165,233,0.16)]',
    group: 'tech',
  },
  womensFashion: {
    icon: Sparkles,
    description: 'Dresses, bags and statement looks.',
    iconClass: 'text-pink-700',
    iconWrapClass: 'bg-pink-100 text-pink-700',
    activeCardClass: 'border-pink-200 bg-pink-50/90 shadow-[0_14px_36px_rgba(236,72,153,0.14)]',
    group: 'fashion',
  },
  mensFashion: {
    icon: Shirt,
    description: 'Outerwear, essentials and street-ready pieces.',
    iconClass: 'text-indigo-700',
    iconWrapClass: 'bg-indigo-100 text-indigo-700',
    activeCardClass: 'border-indigo-200 bg-indigo-50/90 shadow-[0_14px_36px_rgba(99,102,241,0.14)]',
    group: 'fashion',
  },
  beverages: {
    icon: Wine,
    description: 'Wine, coffee, tea and premium bottles.',
    iconClass: 'text-amber-700',
    iconWrapClass: 'bg-amber-100 text-amber-700',
    activeCardClass: 'border-amber-200 bg-amber-50/90 shadow-[0_14px_36px_rgba(245,158,11,0.15)]',
    group: 'consumables',
  },
  tobacco: {
    icon: Flame,
    description: 'Cigars, pipe blends and collector tins.',
    iconClass: 'text-stone-700',
    iconWrapClass: 'bg-stone-200 text-stone-700',
    activeCardClass: 'border-stone-300 bg-stone-100/90 shadow-[0_14px_36px_rgba(120,113,108,0.12)]',
    group: 'consumables',
  },
  beauty: {
    icon: Palette,
    description: 'Skincare, fragrance and vanity favorites.',
    iconClass: 'text-rose-700',
    iconWrapClass: 'bg-rose-100 text-rose-700',
    activeCardClass: 'border-rose-200 bg-rose-50/90 shadow-[0_14px_36px_rgba(244,63,94,0.14)]',
    group: 'fashion',
  },
  sports: {
    icon: Dumbbell,
    description: 'Training gear, sneakers and active picks.',
    iconClass: 'text-emerald-700',
    iconWrapClass: 'bg-emerald-100 text-emerald-700',
    activeCardClass: 'border-emerald-200 bg-emerald-50/90 shadow-[0_14px_36px_rgba(16,185,129,0.14)]',
    group: 'lifestyle',
  },
  gaming: {
    icon: Gamepad2,
    description: 'Consoles, VR and collectible game gear.',
    iconClass: 'text-violet-700',
    iconWrapClass: 'bg-violet-100 text-violet-700',
    activeCardClass: 'border-violet-200 bg-violet-50/90 shadow-[0_14px_36px_rgba(139,92,246,0.14)]',
    group: 'tech',
  },
  homeLiving: {
    icon: House,
    description: 'Decor, kitchen staples and cozy upgrades.',
    iconClass: 'text-cyan-700',
    iconWrapClass: 'bg-cyan-100 text-cyan-700',
    activeCardClass: 'border-cyan-200 bg-cyan-50/90 shadow-[0_14px_36px_rgba(6,182,212,0.14)]',
    group: 'lifestyle',
  },
  collectibles: {
    icon: Gem,
    description: 'Limited finds, nostalgia and rare editions.',
    iconClass: 'text-yellow-700',
    iconWrapClass: 'bg-yellow-100 text-yellow-700',
    activeCardClass: 'border-yellow-200 bg-yellow-50/90 shadow-[0_14px_36px_rgba(234,179,8,0.14)]',
    group: 'lifestyle',
  },
}

const tagGroups = [
  {
    key: 'tech',
    label: 'Tech & Digital',
    description: 'Sharper screens, louder desks, faster play.',
  },
  {
    key: 'fashion',
    label: 'Fashion & Beauty',
    description: 'Wardrobe refreshes and vanity staples.',
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle & Home',
    description: 'Comfort, movement and tasteful corners.',
  },
  {
    key: 'consumables',
    label: 'Consumables',
    description: 'Sips, smoke and after-hours taste.',
  },
] as const

const quickPresets: TagPreset[] = [
  {
    key: 'desk-setup',
    label: 'Desk Setup',
    description: 'Electronics + gaming essentials.',
    icon: Smartphone,
    feedTypes: ['electronics', 'gaming'],
    iconWrapClass: 'bg-sky-100 text-sky-700',
    activeCardClass: 'border-sky-200 bg-sky-50/90 shadow-[0_14px_36px_rgba(14,165,233,0.14)]',
  },
  {
    key: 'style-rotation',
    label: 'Style Rotation',
    description: 'Women, men and beauty picks together.',
    icon: Sparkles,
    feedTypes: ['womensFashion', 'mensFashion', 'beauty'],
    iconWrapClass: 'bg-pink-100 text-pink-700',
    activeCardClass: 'border-pink-200 bg-pink-50/90 shadow-[0_14px_36px_rgba(236,72,153,0.14)]',
  },
  {
    key: 'weekend-reset',
    label: 'Weekend Reset',
    description: 'Home, beauty and beverages.',
    icon: House,
    feedTypes: ['homeLiving', 'beauty', 'beverages'],
    iconWrapClass: 'bg-cyan-100 text-cyan-700',
    activeCardClass: 'border-cyan-200 bg-cyan-50/90 shadow-[0_14px_36px_rgba(6,182,212,0.14)]',
  },
  {
    key: 'active-mode',
    label: 'Active Mode',
    description: 'Sports gear with home-living utility.',
    icon: Dumbbell,
    feedTypes: ['sports', 'homeLiving'],
    iconWrapClass: 'bg-emerald-100 text-emerald-700',
    activeCardClass: 'border-emerald-200 bg-emerald-50/90 shadow-[0_14px_36px_rgba(16,185,129,0.14)]',
  },
  {
    key: 'collectors-room',
    label: 'Collector Room',
    description: 'Collectibles with gaming nostalgia.',
    icon: Gem,
    feedTypes: ['collectibles', 'gaming'],
    iconWrapClass: 'bg-yellow-100 text-yellow-700',
    activeCardClass: 'border-yellow-200 bg-yellow-50/90 shadow-[0_14px_36px_rgba(234,179,8,0.14)]',
  },
  {
    key: 'after-hours',
    label: 'After Hours',
    description: 'Beverages and tobacco only.',
    icon: Wine,
    feedTypes: ['beverages', 'tobacco'],
    iconWrapClass: 'bg-amber-100 text-amber-700',
    activeCardClass: 'border-amber-200 bg-amber-50/90 shadow-[0_14px_36px_rgba(245,158,11,0.15)]',
  },
]

const toOrderedSelection = (selection: FeedType[]) =>
  feedTypes.filter((feedType) => selection.includes(feedType))

const getEffectiveSelection = (selection: FeedType[]) =>
  selection.length === 0 ? [...feedTypes] : toOrderedSelection(selection)

const arraysMatch = (left: FeedType[], right: FeedType[]) =>
  left.length === right.length && left.every((item, index) => item === right[index])

export default function FeedTagFilters() {
  const products = useStore((s) => s.products)
  const selectedFeedTypes = useStore((s) => s.selectedFeedTypes)
  const setSelectedFeedTypes = useStore((s) => s.setSelectedFeedTypes)
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)

  const activeFeedTypes = useMemo(
    () => getEffectiveSelection(selectedFeedTypes),
    [selectedFeedTypes],
  )

  const productCountByFeedType = useMemo(
    () =>
      products.reduce(
        (counts, product) => ({
          ...counts,
          [product.feedType]: (counts[product.feedType] ?? 0) + 1,
        }),
        Object.fromEntries(feedTypes.map((feedType) => [feedType, 0])) as Record<FeedType, number>,
      ),
    [products],
  )

  const visibleProductCount = useMemo(
    () => products.filter((product) => activeFeedTypes.includes(product.feedType)).length,
    [activeFeedTypes, products],
  )

  const presetCountByKey = useMemo(
    () =>
      Object.fromEntries(
        quickPresets.map((preset) => [
          preset.key,
          products.filter((product) => preset.feedTypes.includes(product.feedType)).length,
        ]),
      ) as Record<string, number>,
    [products],
  )

  const isFeedTypeSelected = (feedType: FeedType) => activeFeedTypes.includes(feedType)

  const clearSelection = () => setSelectedFeedTypes([])

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

  const applyPreset = (presetFeedTypes: FeedType[]) => {
    const orderedPreset = toOrderedSelection(presetFeedTypes)
    setSelectedFeedTypes(arraysMatch(activeFeedTypes, orderedPreset) ? [] : orderedPreset)
  }

  return (
    <div className="mx-auto max-w-3xl px-1 py-2 pb-10">
      <div className="sticky top-0 z-20 -mx-1 mb-4 bg-[var(--color-bg)]/92 px-1 pt-1 pb-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={clearSelection}
            disabled={selectedFeedTypes.length === 0}
            className="tap-feedback rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={goBack}
            className="tap-feedback rounded-full border border-[var(--color-border)] bg-white p-2.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Close tag filters"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-3 rounded-[30px] border border-white/80 bg-gradient-to-br from-white via-white to-neutral-100 px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                Tag Curation
              </p>
              <h1 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-[var(--color-text)]">
                Tune your picks
              </h1>
              <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                先用预设快速切换，再用下面的 tag 细调你的首页内容。
              </p>
            </div>

            <div className="shrink-0 rounded-[22px] bg-[var(--color-accent)] px-3 py-2 text-right text-[var(--color-accent-active)] shadow-[0_12px_32px_rgba(204,255,0,0.28)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">Visible</p>
              <p className="text-lg font-semibold leading-none">{visibleProductCount}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em]">items</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
              {selectedFeedTypes.length === 0 ? 'All tags enabled' : `${activeFeedTypes.length} tags active`}
            </span>
            {selectedFeedTypes.length === 0 ? (
              <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                Everything is currently in the mix.
              </span>
            ) : (
              activeFeedTypes.map((feedType) => (
                <span
                  key={feedType}
                  className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-text)]"
                >
                  {feedTypeLabels[feedType]}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Quick moods</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">一键切成更完整的浏览风格。</p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {quickPresets.length} presets
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickPresets.map((preset) => {
            const Icon = preset.icon
            const isExactMatch = arraysMatch(activeFeedTypes, toOrderedSelection(preset.feedTypes))

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset.feedTypes)}
                className={`tap-feedback rounded-[24px] border p-3.5 text-left transition-all ${
                  isExactMatch
                    ? preset.activeCardClass
                    : 'border-[var(--color-border)] bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${preset.iconWrapClass}`}>
                    <Icon size={18} strokeWidth={2.1} />
                  </div>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isExactMatch
                        ? 'border-[var(--color-text)] bg-[var(--color-text)] text-white'
                        : 'border-[var(--color-border)] bg-white text-transparent'
                    }`}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{preset.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{preset.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[var(--color-text-secondary)]">
                  <span>{preset.feedTypes.length} tags</span>
                  <span>{presetCountByKey[preset.key]} items</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="space-y-4">
        {tagGroups.map((group) => {
          const items = feedTypes.filter((feedType) => tagMetaByType[feedType].group === group.key)
          const activeCount = items.filter((feedType) => activeFeedTypes.includes(feedType)).length

          if (items.length === 0) {
            return null
          }

          return (
            <section
              key={group.key}
              className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
                    {group.label}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                    {group.description}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                  {activeCount}/{items.length} live
                </span>
              </div>

              <div className="mt-3 grid gap-2.5">
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
                      className={`tap-feedback w-full rounded-[22px] border p-3 text-left transition-all ${
                        isSelected
                          ? meta.activeCardClass
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_8px_22px_rgba(15,23,42,0.04)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            isSelected ? meta.iconWrapClass : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={2.1}
                            className={isSelected ? meta.iconClass : 'text-neutral-500'}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-text)]">
                              {feedTypeLabels[feedType]}
                            </span>
                            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                              {productCountByFeedType[feedType]} items
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                            {meta.description}
                          </p>
                        </div>

                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-[var(--color-text)] bg-[var(--color-text)] text-white'
                              : 'border-[var(--color-border)] bg-white text-transparent'
                          }`}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <div className="sticky bottom-4 z-20 mt-6">
        <button
          type="button"
          onClick={goBack}
          className="tap-feedback flex w-full items-center justify-between rounded-[26px] bg-[var(--color-text)] px-5 py-4 text-left text-white shadow-[0_18px_40px_rgba(10,10,10,0.24)]"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">Ready</p>
            <p className="mt-1 text-sm font-semibold">Show {visibleProductCount} items</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">
            {selectedFeedTypes.length === 0 ? 'All tags' : `${activeFeedTypes.length} active`}
          </span>
        </button>
      </div>
    </div>
  )
}
