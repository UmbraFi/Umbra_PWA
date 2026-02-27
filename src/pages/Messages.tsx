import { MessageCircle } from 'lucide-react'

const mockConversations = [
  {
    id: '1',
    user: '0x7a3f...e2c1',
    avatar: null,
    lastMessage: 'Is this still available?',
    item: 'Phantom Hoodie',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    user: '0xb4d2...9f8a',
    avatar: null,
    lastMessage: 'Would you take 2.5 SOL?',
    item: 'Shadow Cargo Pants',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    user: '0x1c9e...4b7d',
    avatar: null,
    lastMessage: 'Thanks, shipped!',
    item: 'Void Runner V2',
    time: '3h ago',
    unread: false,
  },
]

export default function Messages() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>

      {mockConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle size={40} strokeWidth={1} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            When you make offers or get inquiries, they'll show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {mockConversations.map((convo) => (
            <button
              key={convo.id}
              className="w-full flex items-center gap-3 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-mono-accent font-medium text-[var(--color-text-secondary)]">
                  {convo.user.slice(0, 4)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${convo.unread ? 'font-semibold' : 'font-normal'}`}>
                    {convo.user}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] shrink-0 ml-2">
                    {convo.time}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                  {convo.item} · {convo.lastMessage}
                </p>
              </div>
              {convo.unread && (
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
