import { useEffect, useRef } from 'react'

export function usePageResume(onResume: () => void, delayMs = 32) {
  const onResumeRef = useRef(onResume)
  onResumeRef.current = onResume

  useEffect(() => {
    let wasHidden = document.visibilityState === 'hidden'
    let resumeTimer = 0

    const scheduleResume = () => {
      if (!wasHidden) return

      wasHidden = false
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        onResumeRef.current()
      }, delayMs)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true
        return
      }

      scheduleResume()
    }

    const markHidden = () => {
      wasHidden = true
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', markHidden)
    window.addEventListener('pageshow', scheduleResume)
    window.addEventListener('focus', scheduleResume)

    return () => {
      window.clearTimeout(resumeTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', markHidden)
      window.removeEventListener('pageshow', scheduleResume)
      window.removeEventListener('focus', scheduleResume)
    }
  }, [delayMs])
}
