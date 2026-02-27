import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const addToCart = useStore((s) => s.addToCart)
  const product = products.find((p) => p.id === id)

  const goToSeller = () => {
    if (product) navigate(`/seller/${encodeURIComponent(product.seller)}`)
  }

  const swipeHandlers = useSwipeNavigation({
    onSwipeRight: () => navigate(-1),
    onSwipeLeft: goToSeller,
  })

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Product not found</p>
        <Link to="/discover" className="btn-primary mt-4 px-6 py-2.5 rounded-lg text-sm">
          Browse Items
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto" {...swipeHandlers}>
      {/* Top Bar */}
      <div className="flex items-center justify-between py-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-100 rounded-lg overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-[4/5] object-cover"
        />
      </motion.div>

      {/* Details */}
      <div className="pt-5 pb-6">
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
          {product.brand}
        </p>
        <h1 className="text-xl font-semibold mt-1">{product.name}</h1>
        <p className="text-lg font-semibold font-mono-accent mt-2">{product.price} SOL</p>

        <div className="flex gap-2 mt-3">
          {product.size && (
            <span className="px-3 py-1.5 text-xs bg-gray-100 rounded-md">Size {product.size}</span>
          )}
          <span className="px-3 py-1.5 text-xs bg-gray-100 rounded-md">{product.condition}</span>
        </div>

        <p className="mt-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {product.description}
        </p>

        {/* Seller */}
        <button
          onClick={goToSeller}
          className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-border)] w-full text-left"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-mono-accent font-medium text-[var(--color-text-secondary)]">
              {product.seller.slice(0, 4)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium font-mono-accent">{product.seller}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Seller</p>
          </div>
        </button>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => addToCart(product)}
            className="btn-primary flex-1 py-3.5 rounded-lg"
          >
            Purchase
          </button>
          <button className="btn-outline px-5 py-3.5 rounded-lg">
            Offer
          </button>
        </div>
      </div>
    </div>
  )
}
