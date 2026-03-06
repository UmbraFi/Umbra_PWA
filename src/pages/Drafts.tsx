import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Image, Archive } from 'lucide-react'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import { getWalletItem, setWalletItem } from '../services/storage'

export type SellType = 'regular' | 'auction' | 'raffle'

export interface SellDraft {
  id: string
  sellType: SellType
  form: {
    description: string
    price: string
    shippingMethod: string
    shippingRegionConfig: {
      type: string
      selectedRegions: string[]
      excludedCountries: string[]
    }
    startingBid: string
    reservePrice: string
    auctionDuration: string
    raffleMinEntry: string
    raffleMaxEntry: string
  }
  photos: string[]
  createdAt: number
  updatedAt: number
}

export function readDrafts(): SellDraft[] {
  return getWalletItem<SellDraft[]>('sell.drafts', [])
}

export function saveDrafts(drafts: SellDraft[]) {
  setWalletItem('sell.drafts', drafts)
}

export function deleteDraft(id: string) {
  const drafts = readDrafts().filter((d) => d.id !== id)
  saveDrafts(drafts)
  return drafts
}

export function addDraft(form: SellDraft['form'], photos: string[], sellType: SellType = 'regular'): SellDraft {
  const now = Date.now()
  const draft: SellDraft = {
    id: crypto.randomUUID(),
    sellType,
    form,
    photos,
    createdAt: now,
    updatedAt: now,
  }
  const drafts = readDrafts()
  drafts.unshift(draft)
  saveDrafts(drafts)
  return draft
}

export default function Drafts() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<SellDraft[]>(() => readDrafts())

  const handleLoad = (draft: SellDraft) => {
    // Store draft id to load in sessionStorage so Sell page can pick it up
    window.sessionStorage.setItem('umbrafi.sell.loadDraft', draft.id)
    navigate(APP_ROUTE_PATHS.sell)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDrafts(deleteDraft(id))
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 pt-24 px-6 pb-nav">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Archive size={28} className="text-[var(--color-text-secondary)]" />
        </div>
        <div>
          <h2 className="text-base font-semibold mb-1">No drafts yet</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tap "Save to Drafts" on the Sell page to save a listing for later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-2 pb-nav space-y-2">
      {drafts.map((draft) => (
        <button
          key={draft.id}
          type="button"
          onClick={() => handleLoad(draft)}
          className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 text-left active:scale-[0.98] transition-all"
        >
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {draft.photos[0] ? (
              <img src={draft.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <Image size={20} className="text-[var(--color-text-secondary)]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {draft.form.description.trim() || 'Untitled draft'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {draft.sellType && draft.sellType !== 'regular' && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-[var(--color-text-secondary)] capitalize">
                  {draft.sellType}
                </span>
              )}
              {draft.form.price && (
                <span className="text-xs text-[var(--color-text-secondary)]">${draft.form.price}</span>
              )}
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {formatDate(draft.updatedAt)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {draft.photos.length > 0 && (
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  {draft.photos.length} photo{draft.photos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => handleDelete(draft.id, e)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Delete draft"
          >
            <Trash2 size={16} />
          </button>
        </button>
      ))}
    </div>
  )
}
