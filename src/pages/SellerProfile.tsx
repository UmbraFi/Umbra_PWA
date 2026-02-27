import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, UserPlus, Star, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'
import ProductCard from '../components/ProductCard'

/** Derive a deterministic number from a string so mock stats stay stable. */
function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const navigate = useNavigate()
  const products = useStore((s) => s.products)

  const sellerProducts = useMemo(
    () => products.filter((p) => p.seller === sellerId),
    [products, sellerId],
  )

  const displayName = sellerId ?? 'Unknown'

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

  const swipeHandlers = useSwipeNavigation({
    onSwipeRight: () => navigate(-1),
  })

  return (
    <div className="max-w-lg mx-auto" {...swipeHandlers}>
      {/* Top Bar */}
      <div className="flex items-center gap-3 py-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft size={22} />
        </button>
        <span className="text-sm font-medium font-mono-accent truncate">
          {displayName}
        </span>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center pt-2 pb-5"
      >
        <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex items-center justify-center mb-3 ring-2 ring-[var(--color-border)]">
          <span className="text-xl font-mono-accent font-bold text-[var(--color-text-secondary)]">
            {displayName.slice(0, 2)}
          </span>
        </div>
        <p className="text-base font-semibold font-mono-accent">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Shield size={12} className="text-[var(--color-accent)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            Joined {stats.joined}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-y border-[var(--color-border)]">
        {[
          { value: sellerProducts.length, label: 'Listings' },
          { value: stats.sales, label: 'Sales' },
          { value: `${totalVolume}`, label: 'Vol (SOL)' },
          { value: stats.rating, label: 'Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="py-3.5 text-center">
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
        <button className="btn-primary flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2">
          <UserPlus size={15} strokeWidth={2} />
          Follow
        </button>
        <button
          onClick={() => navigate('/messages')}
          className="btn-outline flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          <MessageCircle size={15} strokeWidth={2} />
          Message
        </button>
      </div>

      {/* Listings */}
      <div className="mt-6 border-t border-[var(--color-border)] pt-4">
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Listings
        </p>
        {sellerProducts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center py-10">
            No listings yet
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {sellerProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
