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

export const statusLabel: Record<Transaction['status'], string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  disputed: 'Disputed',
}

export const statusColor: Record<Transaction['status'], string> = {
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

export interface ChatMessage {
  id: string
  from: 'them' | 'me' | 'system'
  text: string
  time: string
}

export const mockChatMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 's1', from: 'system', text: 'Transaction created · ORD-0x3f7a', time: '09:58' },
    { id: '1', from: 'them', text: 'Hey, I just paid for the hoodie!', time: '10:02' },
    { id: '2', from: 'me', text: 'Got it, thanks!', time: '10:03' },
    { id: '3', from: 'them', text: 'When can you ship?', time: '10:05' },
  ],
  '2': [
    { id: 's1', from: 'system', text: 'Transaction created · ORD-0xb4d2', time: '09:25' },
    { id: '1', from: 'me', text: 'Hi, I bought the cargo pants', time: '09:30' },
    { id: '2', from: 'them', text: 'Great, I\'ll ship today', time: '09:31' },
    { id: 's2', from: 'system', text: 'Order marked as shipped', time: '09:40' },
    { id: '3', from: 'them', text: 'Tracking number: 9400111...', time: '09:45' },
  ],
  '3': [
    { id: 's1', from: 'system', text: 'Transaction created · ORD-0x1c9e', time: '07:50' },
    { id: '1', from: 'me', text: 'Shipped your order today', time: '08:00' },
    { id: 's2', from: 'system', text: 'Order marked as delivered', time: '08:10' },
    { id: '2', from: 'them', text: 'Thanks, received!', time: '08:15' },
  ],
}
