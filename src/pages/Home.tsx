import { useRef, useCallback, useMemo } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../store/useStore'

const PULL_THRESHOLD = 80

export default function Home() {
  const products = useStore((s) => s.products)
  const isRefreshing = useStore((s) => s.isRefreshing)
  const refreshProducts = useStore((s) => s.refreshProducts)
  const selectedFeedTypes = useStore((s) => s.selectedFeedTypes)
  const isDiscoverPanelOpen = useStore((s) => s.isDiscoverPanelOpen)
  const setDiscoverPanelOpen = useStore((s) => s.setDiscoverPanelOpen)
  const pulling = useRef(false)
  const touchStartY = useRef(0)

  const pullY = useMotionValue(0)
  const rotation = useTransform(pullY, [0, PULL_THRESHOLD], [0, 360])
  const opacity = useTransform(pullY, [0, 30, PULL_THRESHOLD], [0, 0.4, 1])
  const scale = useTransform(pullY, [0, PULL_THRESHOLD], [0.5, 1])

  const filteredProducts = useMemo(
    () =>
      selectedFeedTypes.length === 0
        ? products
        : products.filter((product) => selectedFeedTypes.includes(product.feedType)),
    [products, selectedFeedTypes],
  )

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY <= 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY
      pulling.current = true
    }
  }, [isRefreshing])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || isRefreshing) return
      const dy = e.touches[0].clientY - touchStartY.current
      if (dy > 0) {
        pullY.set(Math.min(dy * 0.4, 120))
      }
    },
    [isRefreshing, pullY],
  )

  const onTouchEnd = useCallback(() => {
    if (!pulling.current) return
    pulling.current = false
    const current = pullY.get()

    if (current >= PULL_THRESHOLD && !isRefreshing) {
      animate(pullY, 48, { type: 'spring', stiffness: 300, damping: 30 })
      refreshProducts().then(() => {
        animate(pullY, 0, { type: 'spring', stiffness: 200, damping: 25 })
      })
    } else {
      animate(pullY, 0, { type: 'spring', stiffness: 300, damping: 25 })
    }
  }, [pullY, isRefreshing, refreshProducts])

  if (isDiscoverPanelOpen) {
    return <div className="min-h-[calc(100vh-8rem)]" />
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullY }}
      >
        <motion.div
          style={{
            rotate: isRefreshing ? undefined : rotation,
            opacity,
            scale,
          }}
          animate={isRefreshing ? { rotate: 360 } : undefined}
          transition={isRefreshing ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <Loader2
            size={20}
            strokeWidth={2}
            className="text-[var(--color-text-secondary)]"
          />
        </motion.div>
      </motion.div>

      {/* Feed Grid — masonry style */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No items in the selected tags</p>
        </div>
      ) : (
        <div className="flex gap-1.5 items-start pb-1.5">
          {[0, 1].map((col) => (
            <div key={col} className="flex-1 min-w-0 flex flex-col gap-1.5">
              {filteredProducts
                .filter((_, i) => i % 2 === col)
                .map((product, i) => {
                  const origIndex = i * 2 + col
                  return (
                    <div key={product.id}>
                      <ProductCard product={product} variant={origIndex % 3 === 0 ? 'tall' : 'normal'} />
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      )}

      {/* End of feed */}
      <div className="py-10 text-center">
        <p className="text-xs text-[var(--color-text-secondary)] font-mono-accent tracking-wide">
          -- end of feed --
        </p>
        <button
          type="button"
          onClick={() => setDiscoverPanelOpen(true)}
          className="inline-block mt-3 text-xs font-medium text-[var(--color-text)] underline underline-offset-2"
        >
          Search marketplace
        </button>
      </div>
    </div>
  )
}
