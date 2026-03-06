import { useEffect, useRef } from 'react'

const PIN_LENGTH = 6

interface PinGridProps {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  disabled?: boolean
}

export default function PinGrid({ value, onChange, autoFocus, disabled }: PinGridProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleTap = () => inputRef.current?.focus()

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={PIN_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
        disabled={disabled}
        autoFocus={autoFocus}
        className="absolute w-full h-full opacity-0 z-10"
        style={{ left: '-9999px' }}
        autoComplete="off"
      />
      <div className="flex gap-2 justify-center" onClick={handleTap}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center transition-colors ${
              i === value.length
                ? 'border-black'
                : value[i]
                  ? 'border-gray-300'
                  : 'border-gray-200'
            }`}
          >
            {value[i] ? (
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export { PIN_LENGTH }
