import { ShoppingBag } from 'lucide-react'

const mockPurchases = [
  { id: '1', item: 'Wireless Noise-Cancelling Headphones', seller: '5wAe...0pLj', date: '2026-03-01', amount: 129.99 },
  { id: '2', item: 'Organic Cotton T-Shirt', seller: '8hFg...7mWx', date: '2026-02-22', amount: 35.00 },
  { id: '3', item: 'Portable Bluetooth Speaker', seller: '4pQw...2nXk', date: '2026-02-15', amount: 59.95 },
]

export default function MyPurchases() {
  return (
    <div className="px-4 py-4">
      {mockPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-lg font-medium mb-1">No purchases yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Items you buy will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockPurchases.map((purchase) => (
            <div key={purchase.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{purchase.item}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Seller: {purchase.seller} · {purchase.date}</p>
              </div>
              <p className="text-sm font-medium font-mono-accent">${purchase.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
