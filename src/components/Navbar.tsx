import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, X, Gavel, ShoppingCart } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { RouteMeta } from '../navigation/routeMeta'
import { useSafeBack } from '../hooks/useSafeBack'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import GlitchLogo from './GlitchLogo'
import ListingTypeBar, { type ListingType } from './ListingTypeBar'
import FollowedSellersBar from './FollowedSellersBar'

interface NavbarProps {
  variant: 'tab' | 'stack'
  routeMeta: RouteMeta
}

export default function Navbar({ variant, routeMeta }: NavbarProps) {
  const navigate = useNavigate()
  const isDiscoverPanelOpen = useStore((s) => s.isDiscoverPanelOpen)
  const setDiscoverPanelOpen = useStore((s) => s.setDiscoverPanelOpen)
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)

  const cartCount = useStore((s) => s.cart.reduce((sum, item) => sum + item.quantity, 0))
  const [listingTypes, setListingTypes] = useState<ListingType[]>([])
  const [tagBarVisible, setTagBarVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (variant !== 'tab' || (routeMeta.kind !== 'home' && routeMeta.key !== 'follow')) return
    let rafId = 0
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const y = window.scrollY
        const delta = y - lastScrollY.current
        if (delta > 3) {
          setTagBarVisible(false)
        } else if (delta < -1) {
          setTagBarVisible(true)
        }
        lastScrollY.current = y
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [variant, routeMeta.kind, routeMeta.key])

  const exitToHome = () => {
    navigate(APP_ROUTE_PATHS.home, { replace: true })
  }

  // Tab variant: logo + cart + search bar for all tabs
  if (variant === 'tab') {
    // Pages that show a simple title header instead of logo + search
    if (routeMeta.key === 'sell') {
      return (
        <nav
          className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center">
            <h1 className="text-xl font-semibold">Listing</h1>
          </div>
          <div className="max-w-7xl mx-auto px-4 pb-2">
            <p className="text-xs text-[var(--color-text-secondary)]">
              AI agent auto-generates title, category & tags
            </p>
          </div>
        </nav>
      )
    }

    if (routeMeta.key === 'messages') {
      return null // Messages page renders its own header
    }

    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Top row: logo + cart */}
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between">
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

        {/* Search bar */}
        <div className="max-w-7xl mx-auto px-3 pb-2">
          {isDiscoverPanelOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-4 py-2.5 border border-[var(--color-border)]">
                <Search size={16} strokeWidth={2} className="text-[var(--color-text-secondary)] shrink-0" />
                <span className="flex-1 text-sm text-[var(--color-text-secondary)]">Searching...</span>
                <div className="w-px h-5 bg-[var(--color-border)]" />
                <Gavel size={16} strokeWidth={2} className="text-[var(--color-text-secondary)] shrink-0" />
              </div>
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
              className="w-full flex items-center gap-2 bg-white rounded-lg px-4 py-2.5 border border-[var(--color-border)] tap-feedback"
            >
              <Search size={16} strokeWidth={2} className="text-[var(--color-text-secondary)]" />
              <span className="flex-1 text-sm text-[var(--color-text-secondary)] text-left">Search products...</span>
              <div className="w-px h-5 bg-[var(--color-border)]" />
              <Gavel size={16} strokeWidth={2} className="text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Tag bar — only on home, hides on scroll up, shows on scroll down */}
        {routeMeta.kind === 'home' && (
          <div
            className="max-w-7xl mx-auto px-4 overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: tagBarVisible ? '60px' : '0px',
              opacity: tagBarVisible ? 1 : 0,
            }}
          >
            <ListingTypeBar selected={listingTypes} onChange={setListingTypes} />
          </div>
        )}

        {/* Followed sellers bar — only on follow page */}
        {routeMeta.key === 'follow' && (
          <div
            className="max-w-7xl mx-auto px-3 overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: tagBarVisible ? '80px' : '0px',
              opacity: tagBarVisible ? 1 : 0,
            }}
          >
            <FollowedSellersBar />
          </div>
        )}
      </nav>
    )
  }

  // Stack variant: back button + title + optional exit
  return (
    <nav
      className="sticky top-0 z-50 bg-[var(--color-bg)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-3 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          className="tap-feedback p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>

        <span className="text-sm font-semibold text-center truncate">{routeMeta.title}</span>

        {routeMeta.showExitButton ? (
          <button
            type="button"
            onClick={exitToHome}
            className="tap-feedback p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Exit to home"
          >
            <X size={20} strokeWidth={2} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </nav>
  )
}
