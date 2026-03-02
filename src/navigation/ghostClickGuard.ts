const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

let blockedUntil = 0
let blockedStackPath = ''
let blockedStackBase = ''
let blockedStackBackTo = ''
let blockedStackUntil = 0

export const armGhostClickGuard = (durationMs: number) => {
  const safeDuration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0
  blockedUntil = Math.max(blockedUntil, now() + safeDuration)
}

export const isGhostClickGuardActive = () => now() < blockedUntil

export const blockStackReentry = (path: string, backTo: string, durationMs: number) => {
  if (!path || !backTo) return
  const safeDuration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0
  const firstSlash = path.indexOf('/', 1)
  const base = firstSlash > 0 ? path.slice(0, firstSlash) : path
  blockedStackPath = path
  blockedStackBase = base
  blockedStackBackTo = backTo
  blockedStackUntil = now() + safeDuration
}

export const getBlockedStackBackTarget = (path: string): string | null => {
  if (!path || now() >= blockedStackUntil) return null
  if (path === blockedStackPath) return blockedStackBackTo
  if (blockedStackBase && path.startsWith(`${blockedStackBase}/`)) return blockedStackBackTo
  return null
}
