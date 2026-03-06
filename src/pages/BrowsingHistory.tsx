import { Clock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toProductPath } from '../navigation/paths'
import type { Product } from '../data/mockProducts'
import EmptyState from '../components/EmptyState'
import ProductListItem from '../components/ProductListItem'

export default function BrowsingHistory() {
  const browsingHistory = useStore((s) => s.browsingHistory)
  const products = useStore((s) => s.products)
  const location = useLocation()
  const navigate = useNavigate()
  const fromPath = `${location.pathname}${location.search}`

  const historyProducts = browsingHistory
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p)

  if (historyProducts.length === 0) {
    return <EmptyState icon={Clock} title="No browsing history" subtitle="Products you view will appear here" />
  }

  return (
    <div className="px-4 py-4">
      <div className="space-y-3">
        {historyProducts.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            onClick={() => navigate(toProductPath(product.id), { state: { from: fromPath } })}
          />
        ))}
      </div>
    </div>
  )
}
