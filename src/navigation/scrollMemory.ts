import { normalizePathname } from './routeMeta'

const positions = new Map<string, number>()
let captureLocked = false

export const toScrollKey = (pathname: string, search = '') =>
  `${normalizePathname(pathname)}${search}`

export const getScrollPosition = (key: string) => positions.get(key)

export const rememberScrollPosition = (key: string, position: number) => {
  positions.set(key, position)
}

export const captureScrollPosition = (key: string, position: number) => {
  if (!captureLocked) {
    positions.set(key, position)
  }
}

export const lockScrollCapture = () => {
  captureLocked = true
}

export const unlockScrollCapture = () => {
  captureLocked = false
}
