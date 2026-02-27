import { useRef, useCallback, type TouchEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

const SWIPE_THRESHOLD = 60
const SWIPE_RATIO = 1.5 // horizontal distance must be 1.5x vertical

export function useSwipeNavigation({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startX = useRef(0)
  const startY = useRef(0)
  const swiping = useRef(false)

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    swiping.current = true
  }, [])

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!swiping.current || e.changedTouches.length !== 1) return
      swiping.current = false

      const deltaX = e.changedTouches[0].clientX - startX.current
      const deltaY = e.changedTouches[0].clientY - startY.current

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
      if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_RATIO) return

      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    },
    [onSwipeLeft, onSwipeRight],
  )

  return { onTouchStart, onTouchEnd }
}
