import { memo, useCallback, useEffect, useRef, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import type { Product } from '../data/mockProducts'
import { toProductPath } from '../navigation/paths'
import { isGhostClickGuardActive } from '../navigation/ghostClickGuard'
import { useStore } from '../store/useStore'

interface Props {
  product: Product
  variant?: 'normal' | 'tall'
}

const preloadedImages = new Set<string>()

const preloadImage = (src: string) => {
  if (!src || preloadedImages.has(src) || typeof Image === 'undefined') return
  const img = new Image()
  img.src = src
  preloadedImages.add(src)
}

const MAX_PRESS_TO_CLICK_GAP_MS = 450

/** Block clicks that fire while pointerEvents are suppressed on the tab layer */
const isLayerBlocked = (el: HTMLElement): boolean => {
  const section = el.closest('section')
  return section !== null && getComputedStyle(section).pointerEvents === 'none'
}

const ProductCard = memo(function ProductCard({ product, variant = 'normal' }: Props) {
  const path = toProductPath(product.id)
  const location = useLocation()
  const lastPressAtRef = useRef(0)
  const addToCart = useStore((s) => s.addToCart)
  const fromPath = `${location.pathname}${location.search}`

  useEffect(() => {
    lastPressAtRef.current = 0
  }, [location.pathname, location.search])

  const markPress = useCallback(() => {
    if (isGhostClickGuardActive()) return
    lastPressAtRef.current = performance.now()
    preloadImage(product.image)
  }, [product.image])

  const handleClick = useCallback((e: MouseEvent) => {
    if (isGhostClickGuardActive()) {
      e.preventDefault()
      return
    }

    // Guard against ghost clicks during stack exit animation
    if (isLayerBlocked(e.currentTarget as HTMLElement)) {
      e.preventDefault()
      return
    }

    // In iOS/standalone PWA, delayed synthetic clicks can fire on this link
    // after exiting an overlay route; require a fresh press on this card.
    const elapsed = performance.now() - lastPressAtRef.current
    if (elapsed > MAX_PRESS_TO_CLICK_GAP_MS) {
      e.preventDefault()
    }
  }, [])

  return (
    <div className="cursor-pointer group bg-white overflow-hidden relative rounded-lg" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <Link
        to={path}
        state={{ from: fromPath }}
        className="block"
        onClick={handleClick}
        onPointerDown={markPress}
        onMouseDown={markPress}
        onTouchStart={markPress}
        onMouseEnter={() => preloadImage(product.image)}
      >
        <div>
          <div className={`${variant === 'tall' ? 'aspect-[3/5]' : 'aspect-[3/4]'} overflow-hidden bg-gray-100 relative rounded-b-lg`}>
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-white/30 text-3xl font-bold tracking-[0.3em] uppercase -rotate-[30deg]"
                style={{ textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>
                SAMPLE
              </span>
            </div>
          </div>
        </div>
        <div className="px-1.5 pt-2.5 pb-2">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {product.brand}
          </p>
          <p className="text-sm font-medium mt-0.5 truncate leading-snug">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold font-mono-accent">{product.price} SOL</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {product.size && `${product.size} / `}{product.condition}
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => addToCart(product)}
        className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ backgroundColor: 'var(--color-accent)' }}
        aria-label="Add to cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4">
          <path d="M10 4.5v11M4.5 10h11" stroke="black" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  )
})

export default ProductCard
