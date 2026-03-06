import { Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'
import { toProductPath } from '../navigation/paths'
import EmptyState from '../components/EmptyState'
import ProductGrid from '../components/ProductGrid'

export default function MySpace() {
  const { publicKey, shortAddress, connected } = useWallet()
  const products = useStore((s) => s.products)
  const navigate = useNavigate()
  const myProducts = connected && publicKey ? products.filter((p) => p.seller === publicKey) : []

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-3">
          <span className="text-xl font-mono-accent font-bold text-gray-300">
            {connected ? publicKey?.slice(0, 2) : '--'}
          </span>
        </div>
        <p className="text-sm font-medium font-mono-accent">{shortAddress || 'Not connected'}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{myProducts.length} items listed</p>
      </div>

      {myProducts.length === 0 ? (
        <EmptyState icon={Store} title="Your storefront is empty" subtitle="List items for sale to fill your space" />
      ) : (
        <ProductGrid products={myProducts} onProductClick={(id) => navigate(toProductPath(id))} />
      )}
    </div>
  )
}
