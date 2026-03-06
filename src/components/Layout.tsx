import { useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { Navigate, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import { normalizePathname, resolveRouteMeta } from '../navigation/routeMeta'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import { armGhostClickGuard, blockStackReentry, getBlockedStackBackTarget } from '../navigation/ghostClickGuard'
import { isSwipeExitActive, clearSwipeExit, setStackRouteActive, useSwipeNavigation } from '../hooks/useSwipeNavigation'
import { useSafeBack } from '../hooks/useSafeBack'

const TAB_PATHS = new Set<string>([
  APP_ROUTE_PATHS.home,
  APP_ROUTE_PATHS.discover,
  APP_ROUTE_PATHS.sell,
  APP_ROUTE_PATHS.messages,
  APP_ROUTE_PATHS.profile,
])

interface StackLocationState {
  from?: string
}

interface StackCacheEntry {
  depth: number
  element: ReactElement
}

const getPathnameFromRoute = (path: string) => {
  const queryIndex = path.indexOf('?')
  return queryIndex >= 0 ? path.slice(0, queryIndex) : path
}

const isStackPath = (path: string) => {
  const pathname = normalizePathname(getPathnameFromRoute(path))
  return !TAB_PATHS.has(pathname)
}

/** Enables swipe-right-to-go-back for every stack route */
function StackSwipeHandler() {
  const goBack = useSafeBack()
  useSwipeNavigation({ onSwipeRight: goBack })
  return null
}

const TRANSITION_DURATION = 0.3
const GHOST_CLICK_GUARD_MS = 50

export default function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()
  const routeMeta = resolveRouteMeta(location.pathname)
  const currentPath = `${location.pathname}${location.search}`
  const normalizedPathname = normalizePathname(location.pathname)
  const locationState = location.state as StackLocationState | null
  const isTabRoute = TAB_PATHS.has(normalizedPathname)
  const shouldAnimate = !reduceMotion
  const tabCacheRef = useRef<Map<string, ReactElement>>(new Map())
  const stackCacheRef = useRef<Map<string, StackCacheEntry>>(new Map())
  const lastActiveTabRef = useRef<string>(APP_ROUTE_PATHS.home)
  const stackOutletRef = useRef<{ path: string; element: ReactElement } | null>(null)

  const isStackRoute = !isTabRoute && !!outlet
  const [exitingStack, setExitingStack] = useState(false)
  const prevIsStackRef = useRef(false)
  const justExitedStack = !isStackRoute && prevIsStackRef.current
  const shouldBlockTabPointerEvents = isStackRoute || justExitedStack || exitingStack
  const shouldShowTapShield = !isStackRoute && (justExitedStack || exitingStack)
  const stackFromPath = isStackRoute && typeof locationState?.from === 'string' && isStackPath(locationState.from)
    ? locationState.from
    : null
  const parentStackDepth = stackFromPath
    ? (stackCacheRef.current.get(stackFromPath)?.depth ?? 1)
    : 0
  const currentStackDepth = isStackRoute ? parentStackDepth + 1 : 0
  const swipeExitActive = isSwipeExitActive()

  // Track when a stack route starts exiting — use useLayoutEffect instead
  // of in-render setState to avoid triggering a synchronous re-render that
  // can cause AnimatePresence to briefly reset the exit animation (flashback).
  useLayoutEffect(() => {
    if (prevIsStackRef.current && !isStackRoute && !exitingStack) {
      const blockMs = Math.ceil(TRANSITION_DURATION * 1000) + GHOST_CLICK_GUARD_MS
      const closedStackPath = stackOutletRef.current?.path
      if (closedStackPath) {
        blockStackReentry(closedStackPath, lastActiveTabRef.current, blockMs)
      }
      armGhostClickGuard(blockMs)
      setExitingStack(true)
    }
    prevIsStackRef.current = isStackRoute
  }, [isStackRoute, exitingStack])

  // Keep the module-level flag in sync so useSwipeNavigation knows whether
  // a stack route is genuinely active (vs. just exiting).
  useLayoutEffect(() => {
    setStackRouteActive(isStackRoute)
  }, [isStackRoute])

  // Block the browser / PWA native edge-swipe back gesture on tab pages.
  // Without this, swiping from the left edge on a first-level page triggers
  // history.back() and unexpectedly switches between tabs.
  const isTabRouteRef = useRef(isTabRoute)
  isTabRouteRef.current = isTabRoute
  useEffect(() => {
    const EDGE = 40
    const isEdgeGestureExempt = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return !!target.closest('[data-edge-gesture-exempt="true"]')
    }

    const handleEdgeTouch = (e: TouchEvent) => {
      if (
        e.touches.length === 1 &&
        e.touches[0].clientX <= EDGE &&
        isTabRouteRef.current
      ) {
        if (isEdgeGestureExempt(e.target)) return
        e.preventDefault()
      }
    }
    document.addEventListener('touchstart', handleEdgeTouch, { passive: false })
    return () => document.removeEventListener('touchstart', handleEdgeTouch)
  }, [])

  // Cache the stack outlet so it persists through the exit animation
  if (isStackRoute && outlet) {
    stackCacheRef.current.set(currentPath, { depth: currentStackDepth, element: outlet })
    stackOutletRef.current = { path: `${location.pathname}${location.search}`, element: outlet }
  }

  if (isTabRoute && outlet && !tabCacheRef.current.has(normalizedPathname)) {
    tabCacheRef.current.set(normalizedPathname, outlet)
  }

  if (isTabRoute) {
    lastActiveTabRef.current = normalizedPathname
  }

  const tabRouteMeta = isStackRoute
    ? resolveRouteMeta(lastActiveTabRef.current)
    : routeMeta
  const showBottomNav = tabRouteMeta.showBottomNav && !shouldBlockTabPointerEvents
  const blockedStackBackTarget = isStackRoute ? getBlockedStackBackTarget(currentPath) : null
  const stackUnderlayEntry = stackFromPath ? stackCacheRef.current.get(stackFromPath) ?? null : null
  const stackUnderlayMeta = stackFromPath
    ? resolveRouteMeta(getPathnameFromRoute(stackFromPath))
    : null
  const stackUnderlayZIndex = stackUnderlayEntry ? 70 + stackUnderlayEntry.depth * 10 : 0
  const currentStackZIndex = isStackRoute ? 70 + currentStackDepth * 10 : 0

  if (blockedStackBackTarget) {
    return <Navigate to={blockedStackBackTarget} replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* ── Tab navbar: outside shift layer so it never moves ── */}
      {tabRouteMeta.showNavbar && <Navbar variant="tab" routeMeta={tabRouteMeta} />}

      {/* ── Tab layer: tab content + bottom nav ── */}
      <div
        data-tab-layer
        data-shifted={isStackRoute || undefined}
        className="min-h-screen flex flex-col"
        style={shouldBlockTabPointerEvents ? { pointerEvents: 'none' } : undefined}
      >
        <main className={`flex-1 px-1.5 relative overflow-x-hidden ${tabRouteMeta.showNavbar ? (tabRouteMeta.key === 'sell' ? 'pt-[calc(env(safe-area-inset-top,0px)+5rem)]' : tabRouteMeta.key === 'messages' ? 'pt-[calc(env(safe-area-inset-top,0px)+5rem)]' : tabRouteMeta.key === 'follow' ? 'pt-[calc(env(safe-area-inset-top,0px)+10.7rem)]' : 'pt-[calc(env(safe-area-inset-top,0px)+7.6rem)]') : 'pt-[calc(env(safe-area-inset-top,0px)+1rem)]'} ${tabRouteMeta.showBottomNav ? 'pb-nav' : 'pb-4'}`}>
          {Array.from(tabCacheRef.current.entries()).map(([path, element]) => {
            const isActive = isTabRoute && path === normalizedPathname
            const isUnderlay = isStackRoute && path === lastActiveTabRef.current
            return (
              <section
                key={path}
                aria-hidden={!isActive}
                data-underlay={isUnderlay || undefined}
                className={isActive || isUnderlay ? 'h-full' : 'hidden'}
                style={shouldBlockTabPointerEvents ? { pointerEvents: 'none' } : undefined}
              >
                {element}
              </section>
            )
          })}
        </main>
        {showBottomNav && <BottomNav />}
      </div>

      {shouldShowTapShield && (
        <div
          aria-hidden="true"
          data-tap-shield
          className="fixed inset-0 z-[90] pointer-events-auto"
        />
      )}

      {isStackRoute && stackUnderlayEntry && stackUnderlayMeta && (
        <div
          aria-hidden="true"
          data-stack-underlay="true"
          className="fixed inset-0 will-change-transform [backface-visibility:hidden] bg-[var(--color-bg)] overflow-y-auto flex flex-col pointer-events-none"
          style={{ zIndex: stackUnderlayZIndex }}
        >
          {stackUnderlayMeta.showNavbar && <Navbar variant="stack" routeMeta={stackUnderlayMeta} />}
          <div className="flex-1 px-2 pb-4">
            {stackUnderlayEntry.element}
          </div>
        </div>
      )}

      {/* ── Stack routes (overlay) ── */}
      <AnimatePresence initial={false} onExitComplete={() => {
        clearSwipeExit()
        // Delay re-enabling pointer events to prevent ghost clicks from
        // residual touch/click events hitting ProductCard links below.
        setTimeout(() => setExitingStack(false), GHOST_CLICK_GUARD_MS)
      }}>
        {isStackRoute && (
          <motion.div
            key={`${location.pathname}${location.search}`}
            initial={shouldAnimate && !swipeExitActive ? { x: '100%' } : false}
            animate={{ x: 0 }}
            exit={swipeExitActive ? { opacity: 0 } : { x: '100%' }}
            transition={shouldAnimate && !swipeExitActive ? { duration: TRANSITION_DURATION, ease: [0.32, 0.72, 0, 1] } : { duration: 0 }}
            data-stack-overlay="current"
            className="fixed inset-0 will-change-transform [backface-visibility:hidden] bg-[var(--color-bg)] overflow-y-auto flex flex-col"
            style={{ zIndex: currentStackZIndex }}
          >
            <StackSwipeHandler />
            {routeMeta.showNavbar && <Navbar variant="stack" routeMeta={routeMeta} />}
            <div className="flex-1 px-2 pb-4">
              {stackOutletRef.current?.element}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
