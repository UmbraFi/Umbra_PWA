/** Preset avatars (type 2): emoji + background color */
export const PRESET_AVATARS: { emoji: string; bg: string }[] = [
  { emoji: '🦊', bg: '#FF6B35' },
  { emoji: '🐺', bg: '#4A5568' },
  { emoji: '🦁', bg: '#D69E2E' },
  { emoji: '🐸', bg: '#38A169' },
  { emoji: '🐼', bg: '#2D3748' },
  { emoji: '🦉', bg: '#6B46C1' },
  { emoji: '🐯', bg: '#DD6B20' },
  { emoji: '🦈', bg: '#3182CE' },
  { emoji: '🦅', bg: '#744210' },
  { emoji: '🐲', bg: '#C53030' },
  { emoji: '🦋', bg: '#805AD5' },
  { emoji: '🐙', bg: '#D53F8C' },
]

/** SVG icon paths (type 3): single <path> d attribute from lucide-style icons */
export const SVG_ICONS: { name: string; path: string }[] = [
  { name: 'shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { name: 'zap', path: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z' },
  { name: 'star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { name: 'heart', path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  { name: 'diamond', path: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z' },
  { name: 'flame', path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
  { name: 'crown', path: 'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14' },
  { name: 'anchor', path: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0v14m-7-8a7 7 0 0 0 14 0' },
  { name: 'sun', path: 'M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' },
  { name: 'moon', path: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
  { name: 'skull', path: 'M12 2a8 8 0 0 0-8 8c0 2.5 1.5 5 4 6v2h8v-2c2.5-1 4-3.5 4-6a8 8 0 0 0-8-8zm-2 14v2m4-2v2' },
  { name: 'ghost', path: 'M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2 2 3-3 3 3 2-2 3 3V10a8 8 0 0 0-8-8z' },
]

/** Color palette for avatar customization */
export const AVATAR_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#78716C', '#1E293B', '#000000',
]
