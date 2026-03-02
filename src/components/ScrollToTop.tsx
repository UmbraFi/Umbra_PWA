import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { resolveRouteMeta } from '../navigation/routeMeta'
import {
  captureScrollPosition,
  getScrollPosition,
  lockScrollCapture,
  toScrollKey,
  unlockScrollCapture,
} from '../navigation/scrollMemory'

export default function ScrollToTop() {
  const { pathname, search } = useLocation()
  const navigationType = useNavigationType()
  const key = toScrollKey(pathname, search)
  const routeMeta = resolveRouteMeta(pathname)
  const shouldRestoreForTab = routeMeta.kind === 'home' || routeMeta.kind === 'tab'
  const activeKeyRef = useRef(key)

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    const saveCurrentPosition = () => {
      captureScrollPosition(activeKeyRef.current, window.scrollY)
    }

    saveCurrentPosition()
    window.addEventListener('scroll', saveCurrentPosition, { passive: true })
    return () => {
      window.removeEventListener('scroll', saveCurrentPosition)
    }
  }, [])

  useLayoutEffect(() => {
    activeKeyRef.current = key

    if (navigationType === 'POP') {
      const savedPosition = getScrollPosition(key) ?? 0
      window.scrollTo({ top: savedPosition, left: 0, behavior: 'auto' })
      unlockScrollCapture()
      return
    }

    if (shouldRestoreForTab) {
      const savedPosition = getScrollPosition(key) ?? 0
      window.scrollTo({ top: savedPosition, left: 0, behavior: 'auto' })
      unlockScrollCapture()
      return
    }

    // Stack routes have their own scroll container (overflow-y-auto).
    // Lock capture so the scroll listener doesn't overwrite the saved
    // tab position with a clamped value (window.scrollY may become 0).
    if (routeMeta.kind === 'stack') {
      lockScrollCapture()
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    unlockScrollCapture()
  }, [key, navigationType, shouldRestoreForTab])

  return null
}
