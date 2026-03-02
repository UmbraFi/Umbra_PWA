import { useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Package, ArrowRight } from 'lucide-react'

export interface Transaction {
  id: string
  orderId: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed'
  product: {
    name: string
    image: string
    price: string
  }
  counterparty: string
  role: 'buyer' | 'seller'
  lastMessage: string
  time: string
  unread: boolean
  unreadCount: number
}

const statusLabel: Record<Transaction['status'], string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  disputed: 'Disputed',
}

const statusColor: Record<Transaction['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  disputed: 'bg-red-100 text-red-700',
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    orderId: 'ORD-0x3f7a',
    status: 'paid',
    product: {
      name: 'Phantom Hoodie',
      image: 'https://placehold.co/80x80/111/fff?text=PH',
      price: '2.5 SOL',
    },
    counterparty: '0x7a3f...e2c1',
    role: 'seller',
    lastMessage: 'When can you ship?',
    time: '2m ago',
    unread: true,
    unreadCount: 1,
  },
  {
    id: '2',
    orderId: 'ORD-0xb4d2',
    status: 'shipped',
    product: {
      name: 'Shadow Cargo Pants',
      image: 'https://placehold.co/80x80/222/fff?text=SC',
      price: '1.8 SOL',
    },
    counterparty: '0xb4d2...9f8a',
    role: 'buyer',
    lastMessage: 'Tracking number: 9400111...',
    time: '1h ago',
    unread: true,
    unreadCount: 2,
  },
  {
    id: '3',
    orderId: 'ORD-0x1c9e',
    status: 'delivered',
    product: {
      name: 'Void Runner V2',
      image: 'https://placehold.co/80x80/333/fff?text=VR',
      price: '3.8 SOL',
    },
    counterparty: '0x1c9e...4b7d',
    role: 'seller',
    lastMessage: 'Thanks, received!',
    time: '3h ago',
    unread: false,
    unreadCount: 0,
  },
]

export default function Messages() {
  const location = useLocation()
  const navigate = useNavigate()
  const fromPath = `${location.pathname}${location.search}`

  const unreadCount = mockTransactions.filter((t) => t.unread).length

  return (
    <div className="max-w-2xl mx-auto py-5 px-4">
      <h1 className="text-xl font-semibold mb-1">Messages</h1>
      <p className="text-xs text-[var(--color-text-secondary)] mb-5">
        {unreadCount} unread · {mockTransactions.length} transactions
      </p>

      {mockTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle size={40} strokeWidth={1} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            When you buy or sell items, transaction chats will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {mockTransactions.map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => navigate(`/chat/${tx.id}`, { state: { from: fromPath } })}
              className="tap-feedback w-full flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_8px_20px_rgba(10,10,10,0.04)] hover:bg-gray-50 transition-colors text-left"
            >
              {/* Product thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                <img
                  src={tx.product.image}
                  alt={tx.product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5">
                  <Package size={12} className="text-[var(--color-text-secondary)]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColor[tx.status]}`}>
                    {statusLabel[tx.status]}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono-accent">
                    {tx.orderId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${tx.unread ? 'font-semibold' : 'font-normal text-[var(--color-text-secondary)]'}`}>
                    {tx.product.name}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0 ml-2">
                    {tx.time}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] truncate mt-0.5">
                  {tx.role === 'buyer' ? 'Seller' : 'Buyer'}: {tx.counterparty}
                </p>
                <p className={`text-xs truncate mt-0.5 ${tx.unread ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                  {tx.lastMessage}
                </p>
              </div>

              {/* Unread badge or arrow */}
              {tx.unread && tx.unreadCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-[var(--color-accent-active)]">
                    {tx.unreadCount}
                  </span>
                </span>
              ) : (
                <ArrowRight size={14} className="text-[var(--color-text-secondary)] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
