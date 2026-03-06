import { useState, useCallback } from 'react'
import { Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toSellerPath } from '../navigation/paths'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import PullToRefreshIndicator from '../components/PullToRefreshIndicator'

export default function FollowedStores() {
  const followedSellers = useStore((s) => s.followedSellers)
  const toggleFollowSeller = useStore((s) => s.toggleFollowSeller)
  const location = useLocation()
  const navigate = useNavigate()
  const fromPath = `${location.pathname}${location.search}`

  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    // Simulate refresh — replace with actual data fetching when available
    await new Promise((r) => setTimeout(r, 800))
    setIsRefreshing(false)
  }, [])
  const { pullY, rotation, opacity, scale, touchHandlers } = usePullToRefresh(handleRefresh, isRefreshing)

  if (followedSellers.length === 0) {
    return (
      <div {...touchHandlers}>
        <PullToRefreshIndicator pullY={pullY} rotation={rotation} opacity={opacity} scale={scale} isRefreshing={isRefreshing} />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <Users size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-lg font-medium mb-1">No followed stores</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Follow sellers to see their updates</p>
        </div>
      </div>
    )
  }

  return (
    <div {...touchHandlers}>
      <PullToRefreshIndicator pullY={pullY} rotation={rotation} opacity={opacity} scale={scale} isRefreshing={isRefreshing} />
      <div className="px-4 py-4">
        <div className="space-y-3">
          {followedSellers.map((seller) => (
            <div key={seller} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <button type="button" onClick={() => navigate(toSellerPath(seller), { state: { from: fromPath } })} className="tap-feedback flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono-accent font-bold text-gray-300">{seller.slice(0, 2)}</span>
                </div>
                <p className="text-sm font-medium font-mono-accent truncate">{seller}</p>
              </button>
              <button type="button" onClick={() => toggleFollowSeller(seller)} className="tap-feedback px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">
                Unfollow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
