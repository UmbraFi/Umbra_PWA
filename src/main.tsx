import { Buffer } from 'buffer'
;(globalThis as any).Buffer = Buffer

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { isGhostClickGuardActive } from './navigation/ghostClickGuard'

// Keep the PWA fixed at 1x scale across touch and trackpad gestures.
const preventBrowserZoom = () => {
  const canScrollHorizontally = (target: EventTarget | null) => {
    let element = target instanceof Element ? target : null
    while (element) {
      if (element instanceof HTMLElement && element.dataset.allowHorizontalSwipe === 'true') {
        return true
      }
      const style = window.getComputedStyle(element)
      const overflowX = style.overflowX
      const isHorizontalScroller =
        (overflowX === 'auto' || overflowX === 'scroll') &&
        element.scrollWidth > element.clientWidth + 1
      if (isHorizontalScroller) {
        return true
      }
      element = element.parentElement
    }
    return false
  }

  const preventGesture = (event: Event) => {
    event.preventDefault()
  }

  let startX = 0
  let startY = 0
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return
    startX = event.touches[0].clientX
    startY = event.touches[0].clientY
  }

  const preventPinchAndHorizontalSwipe = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault()
      return
    }

    if (event.touches.length !== 1) return

    const currentX = event.touches[0].clientX
    const currentY = event.touches[0].clientY
    const deltaX = currentX - startX
    const deltaY = currentY - startY

    // Lock non-scrollable areas to vertical pan only, avoiding iOS edge-swipe drift.
    if (Math.abs(deltaX) > Math.abs(deltaY) && !canScrollHorizontally(event.target)) {
      event.preventDefault()
    }
  }

  let lastTouchEnd = 0
  const preventDoubleTapZoom = (event: TouchEvent) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }

  const preventCtrlWheelZoom = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault()
    }
  }

  document.addEventListener('gesturestart', preventGesture, { passive: false })
  document.addEventListener('gesturechange', preventGesture, { passive: false })
  document.addEventListener('gestureend', preventGesture, { passive: false })
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchmove', preventPinchAndHorizontalSwipe, { passive: false })
  document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })
  window.addEventListener('wheel', preventCtrlWheelZoom, { passive: false })
}

preventBrowserZoom()

const installGhostClickBlocker = () => {
  const blockGhostEvent = (event: Event) => {
    if (!isGhostClickGuardActive()) return
    event.preventDefault()
    event.stopPropagation()
    if ('stopImmediatePropagation' in event) {
      event.stopImmediatePropagation()
    }
  }

  document.addEventListener('click', blockGhostEvent, true)
  document.addEventListener('touchend', blockGhostEvent, true)
  document.addEventListener('pointerup', blockGhostEvent, true)
}

installGhostClickBlocker()

const registerServiceWorker = () => {
  // iOS over local IP runs on insecure HTTP context, where SW registration is unreliable.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('[PWA] SW registration failed:', error)
    })
  })
}

registerServiceWorker()

function Boot() {
  useEffect(() => {
    // Signal to the inline fallback script only after React is mounted.
    ;(window as any).__APP_LOADED = true
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
