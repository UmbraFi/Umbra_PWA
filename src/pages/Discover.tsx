import { useMemo, type MouseEvent } from 'react'
import { BellDot } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import type { Product } from '../data/mockProducts'
import { isGhostClickGuardActive } from '../navigation/ghostClickGuard'
import { toProductPath, toSellerPath } from '../navigation/paths'
import { useStore } from '../store/useStore'
import { getSellerAvatarColor, getSellerAvatarLabel } from '../utils/sellerAvatar'

type SellerUpdate = {
  seller: string
  latestAt: string
  products: Product[]
}

const compareByListedAtDesc = (
  a: Pick<Product, 'listedAt' | 'id'>,
  b: Pick<Product, 'listedAt' | 'id'>,
) => {
  const timeDelta = Date.parse(b.listedAt) - Date.parse(a.listedAt)
  return Number.isNaN(timeDelta) ? b.id.localeCompare(a.id) : timeDelta
}

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

const getPreviewAspectClass = (index: number, total: number) => {
  if (total <= 1) return 'aspect-[4/3]'
  if (total === 2) return index === 0 ? 'aspect-[4/5]' : 'aspect-square'

  const aspectPattern = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/3]']
  return aspectPattern[index % aspectPattern.length]
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
      .sort(compareByListedAtDesc)
  }, [products, followedSellers])

  const selectedSellerSet = useMemo(() => new Set(selectedSellers), [selectedSellers])

  const visibleFeed = useMemo(() => {
    if (selectedSellerSet.size === 0) return followedFeed
    return followedFeed.filter((product) => selectedSellerSet.has(product.seller))
  }, [followedFeed, selectedSellerSet])

  const sellerUpdates = useMemo<SellerUpdate[]>(() => {
    const grouped = new Map<string, Product[]>()

    visibleFeed.forEach((product) => {
      const existing = grouped.get(product.seller)
      if (existing) {
        existing.push(product)
        return
      }

      grouped.set(product.seller, [product])
    })

    return Array.from(grouped.entries())
      .map(([seller, sellerProducts]) => {
        const sortedProducts = [...sellerProducts].sort(compareByListedAtDesc)

        return {
          seller,
          latestAt: sortedProducts[0]?.listedAt ?? '',
          products: sortedProducts,
        }
      })
      .sort((a, b) => compareByListedAtDesc({ listedAt: a.latestAt, id: a.seller }, { listedAt: b.latestAt, id: b.seller }))
  }, [visibleFeed])

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
      <div className="max-w-lg mx-auto pb-2">
        {followedSellers.length === 0 ? (
          <section
            className="rounded-lg bg-white px-6 py-20 text-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <BellDot size={34} strokeWidth={1.8} className="text-[var(--color-text-secondary)] mb-3 mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">You are not following anyone yet</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Follow a seller profile to see newly listed items here.
            </p>
          </section>
        ) : sellerUpdates.length === 0 ? (
          <section
            className="rounded-lg bg-white px-6 py-20 text-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <BellDot size={34} strokeWidth={1.8} className="text-[var(--color-text-secondary)] mb-3 mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              {selectedSellers.length > 0 ? 'No updates from selected sellers' : 'No new listings yet'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {selectedSellers.length > 0
                ? 'Try selecting more sellers or clear the filter.'
                : 'Come back soon to catch the latest drops from your follows.'}
            </p>
          </section>
        ) : (
          <div className="space-y-2.5">
            {sellerUpdates.map((update) => {
              const featuredProduct = update.products[0]

              if (!featuredProduct) return null

              const previewProducts = update.products.slice(0, 4)
              const secondaryProducts = update.products.slice(1, 4)
              const extraCount = update.products.length - previewProducts.length

              return (
                <article key={update.seller} className="flex items-start gap-2.5">
                    <Link
                      to={toSellerPath(update.seller)}
                      state={{ from: fromPath }}
                      className="shrink-0 pt-0.5"
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm"
                        style={{ backgroundColor: getSellerAvatarColor(update.seller) }}
                      >
                        <span className="text-[11px] font-semibold tracking-wide text-white">
                          {getSellerAvatarLabel(update.seller)}
                        </span>
                      </div>
                    </Link>

                    <div
                      className="min-w-0 flex-1 rounded-lg bg-white p-3"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={toSellerPath(update.seller)}
                              state={{ from: fromPath }}
                              className="text-sm font-semibold font-mono-accent truncate"
                            >
                              {update.seller}
                            </Link>
                            <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0">
                              | {getRelativeTime(update.latestAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                            Latest drop
                          </p>
                          <p className="mt-1.5 text-[14px] leading-5 text-[var(--color-text-primary)]">
                            New drop <span className="font-semibold">{featuredProduct.name}</span>
                            {update.products.length > 1 ? ` + ${update.products.length - 1} more item${update.products.length > 2 ? 's' : ''}` : ''}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                          {update.products.length} item{update.products.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="mt-3.5 rounded-lg bg-[var(--color-bg)] p-2">
                        <div className={previewProducts.length === 1 ? 'columns-1' : 'columns-2 [column-gap:0.5rem]'}>
                          {previewProducts.map((product, index) => {
                            const isLastPreview = index === previewProducts.length - 1

                            return (
                              <Link
                                key={product.id}
                                to={toProductPath(product.id)}
                                state={{ from: fromPath }}
                                className="block break-inside-avoid mb-2 last:mb-0"
                                onClick={handleProductLinkClick}
                              >
                                <div className={`${getPreviewAspectClass(index, previewProducts.length)} overflow-hidden rounded-lg bg-gray-100 relative`}>
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 py-2">
                                    <p className="text-[11px] font-medium text-white truncate">
                                      {product.name}
                                    </p>
                                  </div>
                                  {isLastPreview && extraCount > 0 ? (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <span className="text-sm font-semibold text-white">+{extraCount}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                          {featuredProduct.brand}
                        </p>
                        <Link
                          to={toProductPath(featuredProduct.id)}
                          state={{ from: fromPath }}
                          onClick={handleProductLinkClick}
                          className="mt-1 block max-w-full text-[15px] font-semibold leading-5 text-[var(--color-text-primary)] truncate"
                        >
                          {featuredProduct.name}
                        </Link>
                        <p className="mt-1.5 text-[13px] leading-5 text-[var(--color-text-secondary)]">
                          {featuredProduct.description}
                        </p>
                      </div>

                      {secondaryProducts.length > 0 ? (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {secondaryProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={toProductPath(product.id)}
                              state={{ from: fromPath }}
                              onClick={handleProductLinkClick}
                              className="rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          Ships from {featuredProduct.shipFromCountry}
                          {featuredProduct.size ? ` · ${featuredProduct.size}` : ''}
                          {` · ${featuredProduct.condition}`}
                        </span>
                        <span className="text-sm font-semibold font-mono-accent shrink-0">
                          {featuredProduct.price} SOL
                        </span>
                      </div>
                    </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

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
