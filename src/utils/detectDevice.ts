export type Platform = 'android' | 'ios' | 'pc'

export function detectPlatform(): Platform {
  const ua = navigator.userAgent || navigator.vendor
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'pc'
}
