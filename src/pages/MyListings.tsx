import { Package } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'
import { toProductPath } from '../navigation/paths'
import EmptyState from '../components/EmptyState'
import ProductGrid from '../components/ProductGrid'

export default function MyListings() {
  const { publicKey, connected } = useWallet()
  const products = useStore((s) => s.products)
  const location = useLocation()
  const navigate = useNavigate()
  const myProducts = connected && publicKey ? products.filter((p) => p.seller === publicKey) : []
  const fromPath = `${location.pathname}${location.search}`

  if (myProducts.length === 0) {
    return <EmptyState icon={Package} title="No listings yet" subtitle="Items you list for sale will appear here" />
  }

  return (
    <div className="px-4 py-4">
      <ProductGrid products={myProducts} onProductClick={(id) => navigate(toProductPath(id), { state: { from: fromPath } })} />
    </div>
  )
}
