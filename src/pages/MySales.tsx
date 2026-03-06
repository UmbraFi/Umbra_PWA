import { Tag } from 'lucide-react'

const mockSales = [
  { id: '1', item: 'Vintage Leather Jacket', buyer: '3kPx...8nWq', date: '2026-02-28', amount: 89.99 },
  { id: '2', item: 'Handmade Ceramic Mug', buyer: '9fLm...2xRt', date: '2026-02-25', amount: 24.50 },
  { id: '3', item: 'Silver Pendant Necklace', buyer: '7wNk...5pGe', date: '2026-02-20', amount: 45.00 },
]

export default function MySales() {
  return (
    <div className="px-4 py-4">
      {mockSales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Tag size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-lg font-medium mb-1">No sales yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Your completed sales will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockSales.map((sale) => (
            <div key={sale.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Tag size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sale.item}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Buyer: {sale.buyer} · {sale.date}</p>
              </div>
              <p className="text-sm font-medium font-mono-accent">${sale.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
