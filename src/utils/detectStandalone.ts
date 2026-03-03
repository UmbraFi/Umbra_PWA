/** Detect if running as installed PWA (standalone mode) */
export function isStandalone(): boolean {
  // iOS Safari
  if ('standalone' in navigator && (navigator as any).standalone === true) return true
  // Android / desktop via display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  return false
}
