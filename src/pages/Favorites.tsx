import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toProductPath } from '../navigation/paths'
import type { Product } from '../data/mockProducts'
import EmptyState from '../components/EmptyState'
import ProductListItem from '../components/ProductListItem'

export default function Favorites() {
  const favorites = useStore((s) => s.favorites)
  const products = useStore((s) => s.products)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const navigate = useNavigate()

  const favoriteProducts = favorites
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p)

  if (favoriteProducts.length === 0) {
    return <EmptyState icon={Heart} title="No favorites yet" subtitle="Tap the heart icon on products to save them" />
  }

  return (
    <div className="px-4 py-4">
      <div className="space-y-3">
        {favoriteProducts.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            onClick={() => navigate(toProductPath(product.id))}
            rightAction={
              <button type="button" onClick={() => toggleFavorite(product.id)} className="tap-feedback p-1.5 text-red-500">
                <Heart size={18} fill="currentColor" />
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}
