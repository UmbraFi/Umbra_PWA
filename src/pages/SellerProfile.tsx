import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MessageCircle, UserCheck, UserPlus, Star, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useOnChainProfile } from '../hooks/useOnChainProfile'
import { useSafeBack } from '../hooks/useSafeBack'
import ProductCard from '../components/ProductCard'
import AvatarDisplay from '../components/AvatarDisplay'
import { APP_ROUTE_PATHS } from '../navigation/paths'

/** Derive a deterministic number from a string so mock stats stay stable. */
function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const navigate = useNavigate()
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)

  const products = useStore((s) => s.products)
  const followedSellers = useStore((s) => s.followedSellers)
  const toggleFollowSeller = useStore((s) => s.toggleFollowSeller)

  const sellerProducts = useMemo(
    () => products.filter((p) => p.seller === sellerId),
    [products, sellerId],
  )

  const { profile: sellerProfile } = useOnChainProfile(sellerId ?? null)
  const displayName = sellerProfile?.displayName || sellerId || 'Unknown'
  const isFollowing = sellerId ? followedSellers.includes(sellerId) : false

  // Deterministic mock stats based on seller address
  const stats = useMemo(() => {
    const h = hashCode(displayName)
    return {
      sales: (h % 40) + 3,
      rating: +(4 + (h % 10) / 10).toFixed(1),
      joined: `${['Jan', 'Mar', 'Jun', 'Sep', 'Nov'][h % 5]} 2024`,
    }
  }, [displayName])

  const totalVolume = useMemo(
    () => sellerProducts.reduce((sum, p) => sum + p.price, 0).toFixed(1),
    [sellerProducts],
  )


  return (
    <div
      className="max-w-lg mx-auto"
      data-allow-horizontal-swipe="true"
    >
      {/* Back button */}
      <nav
        className="sticky top-0 z-50 bg-[var(--color-bg)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="px-1.5 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="tap-feedback p-1.5 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={20} strokeWidth={1.8} className="text-black" />
          </button>
          <span className="text-sm font-semibold text-center truncate">Seller</span>
          <div className="w-[32px]" />
        </div>
      </nav>

      {/* Profile Header */}
      <div className="flex flex-col items-center pt-2 pb-5">
        <div className="mb-3 ring-2 ring-[var(--color-border)] rounded-full">
          <AvatarDisplay
            avatar={sellerProfile?.avatar ?? null}
            fallbackInitials={displayName.slice(0, 2)}
            size={72}
          />
        </div>
        <p className="text-base font-semibold font-mono-accent">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Shield size={12} className="text-[var(--color-accent)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            Joined {stats.joined}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: sellerProducts.length, label: 'Listings' },
          { value: stats.sales, label: 'Sales' },
          { value: `${totalVolume}`, label: 'Vol (SOL)' },
          { value: stats.rating, label: 'Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="py-3 text-center rounded-xl bg-gray-50">
            <p className="text-base font-semibold font-mono-accent">{value}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Rating Stars */}
      <div className="flex items-center justify-center gap-1 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < Math.round(stats.rating)
                ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                : 'text-gray-200'
            }
          />
        ))}
        <span className="text-xs text-[var(--color-text-secondary)] ml-1">
          {stats.rating}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 px-1">
        <button
          type="button"
          onClick={() => {
            if (sellerId) toggleFollowSeller(sellerId)
          }}
          className={`tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
            isFollowing ? 'btn-outline' : 'btn-primary'
          }`}
        >
          {isFollowing ? <UserCheck size={15} strokeWidth={2} /> : <UserPlus size={15} strokeWidth={2} />}
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button
          type="button"
          onClick={() => navigate(APP_ROUTE_PATHS.messages)}
          className="btn-outline tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          <MessageCircle size={15} strokeWidth={2} />
          Message
        </button>
      </div>

      {/* Listings */}
      <div className="mt-6">
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Listings
        </p>
        {sellerProducts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center py-10">
            No listings yet
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {sellerProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
