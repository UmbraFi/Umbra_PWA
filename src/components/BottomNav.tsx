import { Link, useLocation } from 'react-router-dom'
import { Flame, Compass, PlusCircle, MessageCircle, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'My Feed', icon: Flame },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/sell', label: 'Sell', icon: PlusCircle },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {to === '/sell' ? (
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center -mt-2 web3-glow">
                  <Icon size={20} strokeWidth={2} className="text-black" />
                </div>
              ) : (
                <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
              )}
              <span className={`text-[11px] leading-none ${active ? 'font-semibold' : 'font-normal'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
