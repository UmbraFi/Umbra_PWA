import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X, Gavel, ShoppingCart, ShoppingBag, Ticket, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { SellType } from '../store/useStore'
import type { RouteMeta } from '../navigation/routeMeta'

const SELL_TYPES: { value: SellType; label: string; icon: typeof ShoppingBag }[] = [
  { value: 'regular', label: 'Regular', icon: ShoppingBag },
  { value: 'auction', label: 'Auction', icon: Gavel },
  { value: 'raffle', label: 'Raffle', icon: Ticket },
]
import { useSafeBack } from '../hooks/useSafeBack'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import GlitchLogo from './GlitchLogo'
import ListingTypeBar, { type ListingType } from './ListingTypeBar'
import DiscoverControls from './DiscoverControls'
import FollowedSellersBar from './FollowedSellersBar'
import StackHeader from './StackHeader'

interface NavbarProps {
  variant: 'tab' | 'stack'
  routeMeta: RouteMeta
}

export default function Navbar({ variant, routeMeta }: NavbarProps) {
  const navigate = useNavigate()
  const isDiscoverPanelOpen = useStore((s) => s.isDiscoverPanelOpen)
  const setDiscoverPanelOpen = useStore((s) => s.setDiscoverPanelOpen)
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)

  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const cartCount = useStore((s) => s.cart.reduce((sum, item) => sum + item.quantity, 0))
  const sellType = useStore((s) => s.sellType)
  const setSellType = useStore((s) => s.setSellType)
  const sellStep = useStore((s) => s.sellStep)
  const [listingTypes, setListingTypes] = useState<ListingType[]>(['picks'])
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Reset header to visible whenever navigating back to home/follow
  useEffect(() => {
    if (variant === 'tab' && (routeMeta.kind === 'home' || routeMeta.key === 'follow')) {
      setHeaderVisible(true)
      lastScrollY.current = window.scrollY
    }
  }, [variant, routeMeta.kind, routeMeta.key])

  useEffect(() => {
    if (variant !== 'tab' || (routeMeta.kind !== 'home' && routeMeta.key !== 'follow')) return
    let rafId = 0
    let accumulated = 0
    const SCROLL_THRESHOLD = 12
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const y = window.scrollY
        const delta = y - lastScrollY.current
        lastScrollY.current = y
        // Accumulate scroll in the same direction; reset on direction change
        if ((delta > 0 && accumulated < 0) || (delta < 0 && accumulated > 0)) {
          accumulated = 0
        }
        accumulated += delta
        if (accumulated > SCROLL_THRESHOLD) {
          setHeaderVisible(false)
          accumulated = 0
        } else if (accumulated < -SCROLL_THRESHOLD) {
          setHeaderVisible(true)
          accumulated = 0
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [variant, routeMeta.kind, routeMeta.key])

  // Tab variant: render all header variants together, toggle via display
  if (variant === 'tab') {
    if (routeMeta.key === 'messages') {
      return null // Messages page renders its own header
    }

    const isSell = routeMeta.key === 'sell'
    const isStandard = !isSell

    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* ── Sell header ── */}
        <div style={{ display: isSell ? 'block' : 'none' }}>
          <div className="max-w-7xl mx-auto px-1.5 h-10 flex items-center justify-between">
            <h1 className="text-lg font-semibold pl-2">Listing</h1>
            <button
              type="button"
              onClick={() => navigate(APP_ROUTE_PATHS.drafts)}
              className="tap-feedback p-1.5 text-black transition-colors relative"
              aria-label="Drafts"
            >
              <Archive size={20} strokeWidth={1.8} />
            </button>
          </div>
          <div className="max-w-7xl mx-auto px-1.5 pb-2">
            <div className="flex bg-white rounded-lg p-0.5 border border-[var(--color-border)]">
              {SELL_TYPES.map((t) => {
                const Icon = t.icon
                const active = sellType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSellType(t.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-all ${
                      active
                        ? 'text-[var(--color-accent-active)] font-semibold'
                        : 'text-[var(--color-text-secondary)] font-medium'
                    }`}
                    style={active ? { backgroundColor: 'rgba(204,255,0,0.35)' } : undefined}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Step indicator */}
          <div className="max-w-7xl mx-auto px-6 pb-[3px] pt-1">
            {(() => {
              const steps = ['Photos', 'Describe', 'Price', 'Shipping', 'Submit']
              const current = sellStep
              return (
                <div>
                  <div className="flex items-center">
                    {steps.map((_, i) => (
                      <div key={i} className="flex items-center" style={{ flex: i < steps.length - 1 ? 1 : undefined }}>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors"
                          style={{
                            backgroundColor: i <= current ? 'var(--color-accent)' : '#E5E7EB',
                            boxShadow: i <= current ? '0 0 0 3px rgba(204,255,0,0.25)' : 'none',
                          }}
                        />
                        {i < steps.length - 1 && (
                          <div className="flex-1 h-[2px] mx-1" style={{ backgroundColor: i < current ? 'var(--color-accent)' : '#E5E7EB' }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-1.5">
                    {steps.map((label, i) => (
                      <span
                        key={i}
                        className="flex-1 text-[10px] leading-tight"
                        style={{
                          color: i <= current ? 'var(--color-text)' : 'var(--color-text-secondary)',
                          fontWeight: i <= current ? 600 : 400,
                          textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center',
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ── Standard header (home, follow, profile, etc.) ── */}
        <div style={{ display: isStandard ? 'block' : 'none' }}>
          {/* Top row: logo + cart — hides on scroll */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: headerVisible ? '40px' : '0px',
              opacity: headerVisible ? 1 : 0,
            }}
          >
            <div className="max-w-7xl mx-auto px-1.5 h-10 flex items-center justify-between">
              <Link to={APP_ROUTE_PATHS.home} className="flex items-center">
                <GlitchLogo />
              </Link>
              <button
                type="button"
                onClick={() => navigate(APP_ROUTE_PATHS.cart)}
                className="tap-feedback p-1.5 text-[var(--color-text)] relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar — hides on scroll */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: headerVisible ? '48px' : '0px',
              opacity: headerVisible ? 1 : 0,
            }}
          >
            <div className="max-w-7xl mx-auto px-1.5 pb-0.5">
              {isDiscoverPanelOpen ? (
                <div className="flex items-center gap-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      ;(document.activeElement as HTMLElement)?.blur()
                    }}
                    className="flex-1 flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-[var(--color-border)] focus-within:border-[var(--color-text)] transition-colors"
                  >
                    <Search size={16} strokeWidth={2} className="text-[var(--color-text-secondary)] shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-[var(--color-text-secondary)]"
                    />
                    <button type="submit" className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors" aria-label="Search">
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setDiscoverPanelOpen(false)}
                    className="tap-feedback p-2 text-[var(--color-text-secondary)]"
                    aria-label="Close search"
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDiscoverPanelOpen(true)}
                  className="w-full flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-[var(--color-border)] tap-feedback"
                >
                  <Search size={16} strokeWidth={2} className="text-[var(--color-text-secondary)]" />
                  <span className="flex-1 text-sm text-[var(--color-text-secondary)] text-left">Search products...</span>
                </button>
              )}
            </div>
          </div>

          {/* Tag bar — on home always, on follow when search is open */}
          {(routeMeta.kind === 'home' || (routeMeta.key === 'follow' && isDiscoverPanelOpen)) && (
            <div className="max-w-7xl mx-auto px-1.5">
              <ListingTypeBar selected={listingTypes} onChange={setListingTypes} />
            </div>
          )}

          {/* Price range — only when search is open (home or follow) */}
          {(routeMeta.kind === 'home' || routeMeta.key === 'follow') && isDiscoverPanelOpen && (
            <div className="max-w-7xl mx-auto px-1.5 pt-1.5 pb-1.5">
              <DiscoverControls />
            </div>
          )}

          {/* Followed sellers bar — only on follow page when search is closed */}
          {routeMeta.key === 'follow' && !isDiscoverPanelOpen && (
            <div className="max-w-7xl mx-auto px-1.5">
              <FollowedSellersBar />
            </div>
          )}
        </div>
      </nav>
    )
  }

  // Stack variant: back button + title + optional exit
  return <StackHeader title={routeMeta.title} onBack={goBack} />
}
