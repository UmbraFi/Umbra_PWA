import { useMemo, type MouseEvent } from 'react'
import { BellDot } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toProductPath, toSellerPath } from '../navigation/paths'
import { isGhostClickGuardActive } from '../navigation/ghostClickGuard'

const getRelativeTime = (value: string) => {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return 'Recently'

  const deltaSeconds = Math.floor((Date.now() - timestamp) / 1000)
  if (deltaSeconds < 60) return 'Just now'

  const minutes = Math.floor(deltaSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}


export default function Discover() {
  const location = useLocation()
  const products = useStore((s) => s.products)
  const followedSellers = useStore((s) => s.followedSellers)
  const selectedSellers = useStore((s) => s.selectedFollowedSellers)
  const isDiscoverPanelOpen = useStore((s) => s.isDiscoverPanelOpen)
  const setDiscoverPanelOpen = useStore((s) => s.setDiscoverPanelOpen)

  const followedFeed = useMemo(() => {
    const followedSet = new Set(followedSellers)
    return products
      .filter((product) => followedSet.has(product.seller))
      .sort((a, b) => {
        const timeDelta = Date.parse(b.listedAt) - Date.parse(a.listedAt)
        return Number.isNaN(timeDelta) ? b.id.localeCompare(a.id) : timeDelta
      })
  }, [products, followedSellers])

  const selectedSellerSet = useMemo(() => new Set(selectedSellers), [selectedSellers])

  const visibleFeed = useMemo(() => {
    if (selectedSellerSet.size === 0) return followedFeed
    return followedFeed.filter((product) => selectedSellerSet.has(product.seller))
  }, [followedFeed, selectedSellerSet])

  const fromPath = `${location.pathname}${location.search}`

  const handleProductLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isGhostClickGuardActive()) {
      event.preventDefault()
    }
  }

  if (isDiscoverPanelOpen) {
    return <div className="min-h-[calc(100vh-8rem)]" />
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-8rem)]">
      <div className="max-w-lg mx-auto">
        {followedSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellDot size={34} strokeWidth={1.8} className="text-[var(--color-text-secondary)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">You are not following anyone yet</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Follow a seller profile to see newly listed items here.
            </p>
          </div>
        ) : visibleFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellDot size={34} strokeWidth={1.8} className="text-[var(--color-text-secondary)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              {selectedSellers.length > 0 ? 'No updates from selected sellers' : 'No new listings yet'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {selectedSellers.length > 0
                ? 'Try selecting more sellers or clear the filter.'
                : 'Come back soon to catch the latest drops from your follows.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visibleFeed.map((product) => (
              <article
                key={product.id}
                className="flex gap-3 py-3"
              >
                <Link
                  to={toSellerPath(product.seller)}
                  state={{ from: fromPath }}
                  className="shrink-0 pt-0.5"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-mono-accent font-bold text-[var(--color-text-secondary)]">
                      {product.seller.slice(0, 2)}
                    </span>
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={toSellerPath(product.seller)}
                      state={{ from: fromPath }}
                      className="text-sm font-semibold font-mono-accent truncate"
                    >
                      {product.seller}
                    </Link>
                    <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0">
                      | {getRelativeTime(product.listedAt)}
                    </span>
                  </div>

                  <p className="text-[13px] text-[var(--color-text-primary)] mt-0.5">
                    Listed <span className="font-semibold">{product.name}</span> | {product.brand} | {product.condition}
                  </p>

                  <Link
                    to={toProductPath(product.id)}
                    state={{ from: fromPath }}
                    className="block mt-2"
                    onClick={handleProductLinkClick}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[4/3] object-cover bg-gray-100 rounded-xl"
                    />
                  </Link>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Ships from {product.shipFromCountry}
                    </span>
                    <span className="text-sm font-semibold font-mono-accent">
                      {product.price} SOL
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* End of feed */}
      <div className="py-10 text-center">
        <p className="text-xs text-[var(--color-text-secondary)] font-mono-accent tracking-wide">
          -- end of feed --
        </p>
        <button
          type="button"
          onClick={() => setDiscoverPanelOpen(true)}
          className="inline-block mt-3 text-xs font-medium text-[var(--color-text)] underline underline-offset-2"
        >
          Search marketplace
        </button>
      </div>
    </div>
  )
}
