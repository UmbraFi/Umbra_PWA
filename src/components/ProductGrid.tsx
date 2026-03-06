import type { Product } from '../data/mockProducts'

interface ProductGridProps {
  products: Product[]
  onProductClick: (productId: string) => void
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <button key={product.id} type="button" onClick={() => onProductClick(product.id)} className="tap-feedback text-left rounded-xl overflow-hidden bg-white border border-gray-100">
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          <div className="p-2.5">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">${product.price.toFixed(2)}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
