import { loadWalletData } from './walletCrypto'

function getPrefix(): string {
  const pk = loadWalletData()?.publicKey
  if (!pk) throw new Error('No active wallet')
  return `umbra:${pk.slice(0, 8)}`
}

export function getWalletItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${getPrefix()}:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setWalletItem<T>(key: string, value: T): void {
  localStorage.setItem(`${getPrefix()}:${key}`, JSON.stringify(value))
}

export function removeWalletItem(key: string): void {
  localStorage.removeItem(`${getPrefix()}:${key}`)
}

/** Remove all scoped keys for the current wallet */
export function clearScopedStorage(): void {
  const prefix = getPrefix()
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(`${prefix}:`)) toRemove.push(k)
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}

/** Migrate legacy unscoped keys into the current wallet's scoped storage */
export function migrateToScopedStorage(): void {
  const legacyMappings: [string, string][] = [
    ['umbra_addresses', 'addresses'],
    ['umbrafi.sell.drafts', 'sell.drafts'],
    ['umbrafi.sell.draft', 'sell.draft'],
  ]

  for (const [oldKey, newKey] of legacyMappings) {
    const raw = localStorage.getItem(oldKey)
    if (raw !== null) {
      try {
        const prefix = getPrefix()
        // Only migrate if scoped key doesn't already exist
        if (!localStorage.getItem(`${prefix}:${newKey}`)) {
          localStorage.setItem(`${prefix}:${newKey}`, raw)
        }
        localStorage.removeItem(oldKey)
      } catch {
        // No wallet active — skip migration
      }
    }
  }
}
