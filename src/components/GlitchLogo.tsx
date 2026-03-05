import { useEffect, useRef, useState } from 'react'

const LOGO_EFFECTS = [
  { name: 'v1', durationMs: 920 },
  { name: 'v2', durationMs: 600 },
  { name: 'v3', durationMs: 300 },
] as const

type LogoEffectName = (typeof LOGO_EFFECTS)[number]['name']

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export default function GlitchLogo() {
  const [activeLogoEffect, setActiveLogoEffect] = useState<LogoEffectName | null>(null)
  const waitTimerRef = useRef<number | null>(null)
  const playTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const clearTimers = () => {
      if (waitTimerRef.current !== null) {
        window.clearTimeout(waitTimerRef.current)
        waitTimerRef.current = null
      }
      if (playTimerRef.current !== null) {
        window.clearTimeout(playTimerRef.current)
        playTimerRef.current = null
      }
    }

    const scheduleNext = () => {
      if (cancelled) {
        return
      }

      waitTimerRef.current = window.setTimeout(() => {
        if (cancelled) {
          return
        }

        const nextEffect = LOGO_EFFECTS[Math.floor(Math.random() * LOGO_EFFECTS.length)]
        setActiveLogoEffect(nextEffect.name)

        playTimerRef.current = window.setTimeout(() => {
          if (cancelled) {
            return
          }

          setActiveLogoEffect(null)
          scheduleNext()
        }, nextEffect.durationMs)
      }, randomInt(3000, 8000))
    }

    scheduleNext()

    return () => {
      cancelled = true
      clearTimers()
      setActiveLogoEffect(null)
    }
  }, [])

  const logoEffectClass = activeLogoEffect
    ? `umbra-logo-glitch--active umbra-logo-glitch--${activeLogoEffect}`
    : ''

  return (
    <span
      className={`umbra-logo-glitch ${logoEffectClass} inline-flex items-center px-2.5 py-1 text-[1rem] leading-none font-black tracking-[-0.03em]`}
    >
      <span
        className="umbra-logo-glitch__text inline-block italic"
        data-text="UMBRAFI"
      >
        UMBRAFI
      </span>
    </span>
  )
}
