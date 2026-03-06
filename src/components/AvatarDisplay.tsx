import type { AvatarData } from '../services/profileContract'
import { PRESET_AVATARS, SVG_ICONS } from '../assets/avatarData'

interface AvatarDisplayProps {
  avatar?: AvatarData | null
  fallbackInitials?: string
  size?: number
  className?: string
}

export default function AvatarDisplay({ avatar, fallbackInitials = '--', size = 72, className = '' }: AvatarDisplayProps) {
  const fontSize = size * 0.35

  // Default gray circle with initials
  if (!avatar) {
    return (
      <div
        className={`rounded-full bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="font-mono-accent font-bold text-gray-300" style={{ fontSize }}>
          {fallbackInitials}
        </span>
      </div>
    )
  }

  // Type 1: solid color + letter
  if (avatar.type === 1) {
    return (
      <div
        className={`rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size, backgroundColor: avatar.color }}
      >
        <span className="font-mono-accent font-bold text-white" style={{ fontSize: size * 0.4 }}>
          {avatar.letter}
        </span>
      </div>
    )
  }

  // Type 2: preset avatar
  if (avatar.type === 2) {
    const preset = PRESET_AVATARS[avatar.presetIndex] ?? PRESET_AVATARS[0]
    return (
      <div
        className={`rounded-full flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: size, height: size, backgroundColor: preset.bg }}
      >
        <span style={{ fontSize: size * 0.45 }}>{preset.emoji}</span>
      </div>
    )
  }

  // Type 3: SVG icon + solid color
  if (avatar.type === 3) {
    const icon = SVG_ICONS[avatar.svgIndex] ?? SVG_ICONS[0]
    const iconSize = size * 0.45
    return (
      <div
        className={`rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size, backgroundColor: avatar.color }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon.path} />
        </svg>
      </div>
    )
  }

  return null
}
