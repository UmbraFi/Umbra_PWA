import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { animateStackOut, isSwipeExitActive } from './useSwipeNavigation'

interface BackState {
  from?: string
}

const hasRouterHistory = () => {
  const historyState = window.history.state as { idx?: number } | null
  return typeof historyState?.idx === 'number' && historyState.idx > 0
}

export function useSafeBack(fallbackPath = '/') {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(() => {
    const currentPath = `${location.pathname}${location.search}`
    const state = location.state as BackState | null
    const from = typeof state?.from === 'string' ? state.from : null

    const doNavigate = () => {
      if (hasRouterHistory()) {
        navigate(-1)
        return
      }

      if (from && from !== currentPath) {
        navigate(from, { replace: true })
        return
      }

      navigate(fallbackPath, { replace: true })
    }

    if (isSwipeExitActive()) {
      doNavigate()
      return
    }

    animateStackOut(doNavigate)
  }, [navigate, fallbackPath, location.pathname, location.search, location.state])
}
