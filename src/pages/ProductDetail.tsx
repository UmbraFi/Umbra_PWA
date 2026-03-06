import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'
import { APP_ROUTE_PATHS, toSellerPath } from '../navigation/paths'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const products = useStore((s) => s.products)
  const addToCart = useStore((s) => s.addToCart)
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const addToHistory = useStore((s) => s.addToHistory)
  const product = products.find((p) => p.id === id)
  const isFavorited = id ? favorites.includes(id) : false
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (id) addToHistory(id)
  }, [id, addToHistory])

  useEffect(() => {
    setImageLoaded(false)
  }, [product?.image])

  const goToSeller = () => {
    if (product) {
      navigate(toSellerPath(product.seller), {
        state: { from: `${location.pathname}${location.search}` },
      })
    }
  }

  useSwipeNavigation({
    onSwipeLeft: goToSeller,
  })

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Product not found</p>
        <Link to={APP_ROUTE_PATHS.discover} className="btn-primary mt-4 px-6 py-2.5 rounded-lg text-sm">
          Browse Items
        </Link>
      </div>
    )
  }

  return (
    <div
      className="max-w-lg mx-auto pt-3"
      data-allow-horizontal-swipe="true"
    >
      {/* Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageLoaded(true)}
          className={`w-full aspect-[4/5] object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      </div>

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
          type="button"
          onClick={goToSeller}
          className="tap-feedback flex items-center gap-3 mt-5 rounded-xl bg-gray-50 px-3 py-3.5 w-full text-left"
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
            type="button"
            onClick={() => addToCart(product)}
            className="btn-primary tap-feedback flex-1 py-3.5 rounded-lg"
          >
            Purchase
          </button>
          <button type="button" className="btn-outline tap-feedback px-5 py-3.5 rounded-lg">
            Offer
          </button>
          <button
            type="button"
            onClick={() => id && toggleFavorite(id)}
            className="tap-feedback px-4 py-3.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFavorited ? 'text-red-500' : 'text-gray-400'}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
