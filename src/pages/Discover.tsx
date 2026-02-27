import { useState } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../store/useStore'

const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories']

export default function Discover() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, getFilteredProducts } = useStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const filtered = getFilteredProducts()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localQuery)
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="pt-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search items, brands..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
          />
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-[var(--color-text)] text-white'
                : 'bg-gray-100 text-[var(--color-text)] hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No items found</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">{filtered.length} results</p>
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
