import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '../data/mockProducts'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="cursor-pointer group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden rounded-sm bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
        <div className="pt-2.5 pb-1">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {product.brand}
          </p>
          <p className="text-sm font-medium mt-0.5 truncate leading-snug">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold font-mono-accent">{product.price} SOL</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {product.size && `${product.size} · `}{product.condition}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
