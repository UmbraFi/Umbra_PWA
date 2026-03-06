import { useCallback, useEffect, useState } from 'react'
import {
  fetchOnChainProfile,
  buildUpdateProfileTx,
  type OnChainProfile,
} from '../services/profileContract'

interface UseOnChainProfileResult {
  profile: OnChainProfile | null
  loading: boolean
  updating: boolean
  error: string | null
  updateProfile: (data: OnChainProfile) => Promise<boolean>
}

export function useOnChainProfile(publicKey: string | null): UseOnChainProfileResult {
  const [profile, setProfile] = useState<OnChainProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicKey) {
      setProfile(null)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchOnChainProfile(publicKey)
      .then((p) => { if (!cancelled) setProfile(p) })
      .catch(() => { if (!cancelled) setProfile(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [publicKey])

  const updateProfile = useCallback(async (data: OnChainProfile): Promise<boolean> => {
    if (!publicKey) return false
    setUpdating(true)
    setError(null)
    try {
      const tx = buildUpdateProfileTx(publicKey, data)
      // In a real implementation this would be signed and sent.
      // For now, log the transaction for verification.
      console.log('[ProfileContract] Built update tx:', tx)
      // Optimistically update local state
      setProfile(data)
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setUpdating(false)
    }
  }, [publicKey])

  return { profile, loading, updating, error, updateProfile }
}
