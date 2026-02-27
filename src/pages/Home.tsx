import { useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../store/useStore'

const PULL_THRESHOLD = 80

export default function Home() {
  const products = useStore((s) => s.products)
  const isRefreshing = useStore((s) => s.isRefreshing)
  const refreshProducts = useStore((s) => s.refreshProducts)

  const pulling = useRef(false)
  const touchStartY = useRef(0)

  const pullY = useMotionValue(0)
  const rotation = useTransform(pullY, [0, PULL_THRESHOLD], [0, 360])
  const opacity = useTransform(pullY, [0, 30, PULL_THRESHOLD], [0, 0.4, 1])
  const scale = useTransform(pullY, [0, PULL_THRESHOLD], [0.5, 1])

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
      // Snap to loading position
      animate(pullY, 48, { type: 'spring', stiffness: 300, damping: 30 })
      refreshProducts().then(() => {
        animate(pullY, 0, { type: 'spring', stiffness: 200, damping: 25 })
      })
    } else {
      animate(pullY, 0, { type: 'spring', stiffness: 300, damping: 25 })
    }
  }, [pullY, isRefreshing, refreshProducts])

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

      {/* Feed Grid */}
      <div className="grid grid-cols-2 gap-2">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* End of feed */}
      <div className="py-10 text-center">
        <p className="text-xs text-[var(--color-text-secondary)] font-mono-accent tracking-wide">
          — end of feed —
        </p>
        <Link
          to="/discover"
          className="inline-block mt-3 text-xs font-medium text-[var(--color-text)] underline underline-offset-2"
        >
          Discover more
        </Link>
      </div>
    </div>
  )
}
