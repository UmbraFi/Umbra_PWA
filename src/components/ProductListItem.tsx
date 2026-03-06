import type { Product } from '../data/mockProducts'

interface ProductListItemProps {
  product: Product
  onClick: () => void
  rightAction?: React.ReactNode
}

export default function ProductListItem({ product, onClick, rightAction }: ProductListItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <button type="button" onClick={onClick} className="tap-feedback flex items-center gap-3 flex-1 min-w-0 text-left">
        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{product.brand}</p>
        </div>
        <p className="text-sm font-medium font-mono-accent">${product.price.toFixed(2)}</p>
      </button>
      {rightAction}
    </div>
  )
}
