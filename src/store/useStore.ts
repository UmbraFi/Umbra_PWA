import { create } from 'zustand'
import { mockProducts, type Product } from '../data/mockProducts'

interface CartItem {
  product: Product
  quantity: number
}

interface Store {
  products: Product[]
  cart: CartItem[]
  searchQuery: string
  selectedCategory: string
  isRefreshing: boolean
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getFilteredProducts: () => Product[]
  refreshProducts: () => Promise<void>
}

export const useStore = create<Store>()((set, get) => ({
  products: mockProducts,
  cart: [],
  searchQuery: '',
  selectedCategory: 'All',
  isRefreshing: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { cart: [...state.cart, { product, quantity: 1 }] }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  clearCart: () => set({ cart: [] }),

  refreshProducts: async () => {
    set({ isRefreshing: true })
    await new Promise((r) => setTimeout(r, 600))
    set((state) => {
      const shuffled = [...state.products].sort(() => Math.random() - 0.5)
      return { products: shuffled, isRefreshing: false }
    })
  },

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategory } = get()
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  },
}))
