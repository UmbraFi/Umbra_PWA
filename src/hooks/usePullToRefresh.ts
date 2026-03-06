import { useRef, useCallback } from 'react'
import { animate, useMotionValue, useTransform } from 'framer-motion'

const PULL_THRESHOLD = 80

export function usePullToRefresh(onRefresh: () => Promise<void>, isRefreshing: boolean) {
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
      animate(pullY, 48, { type: 'spring', stiffness: 300, damping: 30 })
      onRefresh().then(() => {
        animate(pullY, 0, { type: 'spring', stiffness: 200, damping: 25 })
      })
    } else {
      animate(pullY, 0, { type: 'spring', stiffness: 300, damping: 25 })
    }
  }, [pullY, isRefreshing, onRefresh])

  return {
    pullY,
    rotation,
    opacity,
    scale,
    isRefreshing,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  }
}
