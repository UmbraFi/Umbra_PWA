import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'
import { type SortMode, useStore } from '../store/useStore'

const sortOptions: SortMode[] = ['Default Ranking', 'Seller Reputation', 'Product Quality']

type PanelKey = 'sort' | 'price' | 'shipFrom' | 'deliverTo'

const getTriggerClass = (isActive: boolean) =>
  `shrink-0 py-1 text-xs transition-colors ${
    isActive
      ? 'font-semibold text-[var(--color-text)]'
      : 'font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
  }`

const getOptionClass = (isActive: boolean) =>
  `px-3 py-2 rounded-full text-xs font-medium transition-colors ${
    isActive
      ? 'bg-[var(--color-accent-50)] text-[var(--color-text)]'
      : 'bg-gray-100 text-[var(--color-text)] hover:bg-gray-200'
  }`

const parsePriceInput = (value: string): number | null => {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

const getPriceSummary = (minPrice: number | null, maxPrice: number | null) => {
  if (minPrice === null && maxPrice === null) return 'Any'
  if (minPrice !== null && maxPrice !== null) return `${minPrice}-${maxPrice} SOL`
  if (minPrice !== null) return `>=${minPrice} SOL`
  return `<=${maxPrice} SOL`
}

const getCountrySummary = (countries: string[]) => {
  if (countries.length === 0) return 'Any'
  if (countries.length <= 2) return countries.join(', ')
  return `${countries.slice(0, 2).join(', ')} +${countries.length - 2}`
}

interface DiscoverControlsProps {
  className?: string
  autoFocusInput?: boolean
}

const DiscoverControls = memo(function DiscoverControls({
  className,
  autoFocusInput = false,
}: DiscoverControlsProps) {
  const {
    products,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    minPrice,
    maxPrice,
    setPriceRange,
    shipFromCountries,
    toggleShipFromCountry,
    deliverToCountries,
    toggleDeliverToCountry,
    clearDiscoverFilters,
  } = useStore()

  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
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

  useEffect(() => {
    if (!autoFocusInput) return
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [autoFocusInput])

  const shipFromOptions = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.shipFromCountry)),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const deliverToOptions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((product) => product.deliverableCountries)),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const hasActiveFilter =
    sortMode !== 'Default Ranking' ||
    minPrice !== null ||
    maxPrice !== null ||
    shipFromCountries.length > 0 ||
    deliverToCountries.length > 0

  const togglePanel = (panel: PanelKey) =>
    setActivePanel((prev) => (prev === panel ? null : panel))

  const applyPriceRange = () => {
    setPriceRange(parsePriceInput(priceDraft.min), parsePriceInput(priceDraft.max))
    setActivePanel(null)
  }

  const clearFilters = () => {
    clearDiscoverFilters()
    setPriceDraft({ min: '', max: '' })
    setActivePanel(null)
  }

  return (
    <div className={className}>
      <div className="pt-1.5 pb-1">
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            ref={searchInputRef}
            autoFocus={autoFocusInput}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, brands..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
          />
        </form>
      </div>

      <div className="pb-1">
        <div className="flex items-center justify-between pb-1">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Filter size={12} />
            Filters
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => togglePanel('sort')}
            className={getTriggerClass(activePanel === 'sort' || sortMode !== 'Default Ranking')}
          >
            Sort: {sortMode}
            <ChevronDown size={14} className="inline ml-1" />
          </button>
          <button
            type="button"
            onClick={() => togglePanel('price')}
            className={getTriggerClass(activePanel === 'price' || minPrice !== null || maxPrice !== null)}
          >
            Price: {getPriceSummary(minPrice, maxPrice)}
            <ChevronDown size={14} className="inline ml-1" />
          </button>
          <button
            type="button"
            onClick={() => togglePanel('shipFrom')}
            className={getTriggerClass(activePanel === 'shipFrom' || shipFromCountries.length > 0)}
          >
            Ship from: {getCountrySummary(shipFromCountries)}
            <ChevronDown size={14} className="inline ml-1" />
          </button>
          <button
            type="button"
            onClick={() => togglePanel('deliverTo')}
            className={getTriggerClass(activePanel === 'deliverTo' || deliverToCountries.length > 0)}
          >
            Deliver to: {getCountrySummary(deliverToCountries)}
            <ChevronDown size={14} className="inline ml-1" />
          </button>
        </div>

        {activePanel && (
          <div className="mt-3 p-3 border border-[var(--color-border)] rounded-xl bg-white">
            {activePanel === 'sort' && (
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSortMode(option)
                      setActivePanel(null)
                    }}
                    className={getOptionClass(sortMode === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {activePanel === 'price' && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">
                      Min price (SOL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceDraft.min}
                      onChange={(e) =>
                        setPriceDraft((prev) => ({ ...prev, min: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">
                      Max price (SOL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceDraft.max}
                      onChange={(e) =>
                        setPriceDraft((prev) => ({ ...prev, max: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={applyPriceRange}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-[var(--color-text)] text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'shipFrom' && (
              <div className="flex flex-wrap gap-2">
                {shipFromOptions.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleShipFromCountry(country)}
                    className={getOptionClass(shipFromCountries.includes(country))}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}

            {activePanel === 'deliverTo' && (
              <div className="flex flex-wrap gap-2">
                {deliverToOptions.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleDeliverToCountry(country)}
                    className={getOptionClass(deliverToCountries.includes(country))}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default DiscoverControls
