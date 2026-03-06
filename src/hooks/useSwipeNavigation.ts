import { useRef, useEffect } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 0.4
const EDGE_THRESHOLD = 40
const SWIPE_RATIO = 1.2

// Module-level flag: when true, Layout should skip framer-motion exit animation
// because the swipe already animated the overlay off-screen.
let _swipeExitActive = false
export const isSwipeExitActive = () => _swipeExitActive
export const clearSwipeExit = () => { _swipeExitActive = false }

// Module-level flag set by Layout to indicate a stack route is truly active
// (not just lingering in the DOM during an exit animation).
let _stackRouteActive = false
export const setStackRouteActive = (v: boolean) => { _stackRouteActive = v }
export const isStackRouteActive = () => _stackRouteActive

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function useSwipeNavigation({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)
  const swiping = useRef(false)
  const directionLocked = useRef(false)
  const isHorizontal = useRef(false)
  const isEdgeSwipe = useRef(false)
  const rafId = useRef(0)
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight })
  callbacksRef.current = { onSwipeLeft, onSwipeRight }

  const UNDERLAY_SHIFT = -80 // must match index.css [data-tab-layer][data-shifted]

  const getOverlay = () => document.querySelector<HTMLElement>('[data-stack-overlay]')
  const getTabLayer = () => document.querySelector<HTMLElement>('[data-tab-layer]')
  const getDimmer = () => document.querySelector<HTMLElement>('[data-swipe-dimmer]')

  const applyTransform = (px: number) => {
    const vw = window.innerWidth
    const overlay = getOverlay()
    const tabLayer = getTabLayer()
    const dimmer = getDimmer()

    if (px === 0) {
      if (overlay) {
        overlay.style.transform = ''
        overlay.style.transition = ''
      }
      if (tabLayer) {
        tabLayer.style.transform = ''
        tabLayer.style.transition = ''
      }
      if (dimmer) {
        dimmer.style.opacity = ''
        dimmer.style.transition = ''
      }
    } else {
      const clamped = clamp(px, 0, vw)
      const progress = clamped / vw
      // Overlay slides right
      if (overlay) {
        overlay.style.transition = 'none'
        overlay.style.transform = `translateX(${clamped}px)`
      }
      // Tab layer shifts back toward center (from UNDERLAY_SHIFT toward 0)
      if (tabLayer) {
        const tabX = UNDERLAY_SHIFT * (1 - progress)
        tabLayer.style.transition = 'none'
        tabLayer.style.transform = `translateX(${tabX}px)`
      }
      if (dimmer) {
        dimmer.style.transition = 'none'
        dimmer.style.opacity = `${1 - progress}`
      }
    }
  }

  const snapBack = () => {
    const overlay = getOverlay()
    const tabLayer = getTabLayer()
    const dimmer = getDimmer()
    if (overlay) {
      overlay.style.transition = 'transform 0.2s ease-out'
      overlay.style.transform = ''
    }
    if (tabLayer) {
      tabLayer.style.transition = 'transform 0.2s ease-out'
      tabLayer.style.transform = `translateX(${UNDERLAY_SHIFT}px)`
    }
    if (dimmer) {
      dimmer.style.transition = 'opacity 0.2s ease-out'
      dimmer.style.opacity = ''
    }
  }

  const animateOut = (cb: () => void) => {
    const vw = window.innerWidth
    const overlay = getOverlay()
    const tabLayer = getTabLayer()
    const dimmer = getDimmer()
    if (overlay) {
      overlay.style.transition = 'transform 0.15s ease-out'
      overlay.style.transform = `translateX(${vw}px)`
    }
    if (tabLayer) {
      tabLayer.style.transition = 'transform 0.15s ease-out'
      tabLayer.style.transform = 'translateX(0px)'
    }
    if (dimmer) {
      dimmer.style.transition = 'opacity 0.15s ease-out'
      dimmer.style.opacity = '0'
    }
    // Signal Layout to skip framer-motion exit animation (element is already off-screen)
    _swipeExitActive = true
    setTimeout(() => {
      // Hide overlay before navigating so framer-motion's exit animation
      // (which resets transform to x:0) doesn't cause a visible flash-back.
      // Framer-motion only controls `transform` in the exit variant, not
      // opacity, so this inline style survives the exit frame.
      if (overlay) {
        overlay.style.opacity = '0'
        overlay.style.visibility = 'hidden'
      }
      cb()
      // Defer tab-layer cleanup until after React has re-rendered and
      // removed the data-shifted attribute.  Clearing inline styles
      // synchronously causes a brief jump to -80px (the CSS rule)
      // before data-shifted is removed, which produces a visible flicker.
      requestAnimationFrame(() => {
        if (tabLayer) {
          tabLayer.style.transform = ''
          tabLayer.style.transition = ''
        }
      })
    }, 150)
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      if (touch.clientX > EDGE_THRESHOLD || !callbacksRef.current.onSwipeRight) return
      // Only allow edge-swipe when a stack route is truly active (not just
      // lingering in the DOM during an exit animation).
      if (!_stackRouteActive) return

      startX.current = touch.clientX
      startY.current = touch.clientY
      startTime.current = Date.now()
      swiping.current = true
      directionLocked.current = false
      isHorizontal.current = false
      isEdgeSwipe.current = true
      e.preventDefault()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!swiping.current || e.touches.length !== 1) return

      const deltaX = e.touches[0].clientX - startX.current
      const deltaY = e.touches[0].clientY - startY.current
      const absDx = Math.abs(deltaX)
      const absDy = Math.abs(deltaY)

      if (!directionLocked.current && (absDx > 8 || absDy > 8)) {
        directionLocked.current = true
        isHorizontal.current = absDx > absDy * SWIPE_RATIO
        if (!isHorizontal.current) {
          swiping.current = false
          return
        }
      }

      if (!directionLocked.current || !isHorizontal.current) return
      e.preventDefault()

      if (deltaX > 0 && isEdgeSwipe.current) {
        cancelAnimationFrame(rafId.current)
        const dx = deltaX
        rafId.current = requestAnimationFrame(() => applyTransform(dx))
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swiping.current || e.changedTouches.length !== 1) return
      swiping.current = false
      cancelAnimationFrame(rafId.current)

      const deltaX = e.changedTouches[0].clientX - startX.current
      const absDx = Math.abs(deltaX)
      const elapsed = Date.now() - startTime.current
      const velocity = elapsed > 0 ? absDx / elapsed : 0

      if (deltaX > 0 && isEdgeSwipe.current && isHorizontal.current) {
        if (absDx >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD) {
          e.preventDefault()
          animateOut(() => callbacksRef.current.onSwipeRight?.())
          return
        }
        snapBack()
        return
      }

      applyTransform(0)

      if (deltaX < 0 && isHorizontal.current && (absDx >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD)) {
        e.preventDefault()
        callbacksRef.current.onSwipeLeft?.()
      }
    }

    const handleTouchCancel = () => {
      if (!swiping.current) return
      swiping.current = false
      cancelAnimationFrame(rafId.current)
      snapBack()
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchCancel)
      cancelAnimationFrame(rafId.current)
    }
  })

  // Separate unmount-only cleanup for tabLayer styles so re-renders
  // during exit animation don't reset the CSS transition mid-way.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      const tabLayer = document.querySelector<HTMLElement>('[data-tab-layer]')
      if (tabLayer) {
        tabLayer.style.transform = ''
        tabLayer.style.transition = ''
      }
    }
  }, [])

}
