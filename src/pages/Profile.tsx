import { Wallet, Package, Heart, Settings } from 'lucide-react'

export default function Profile() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="pt-6 pb-5 flex flex-col items-center text-center">
        <div className="rounded-full bg-gray-100 flex items-center justify-center mb-3" style={{ width: 72, height: 72 }}>
          <span className="text-2xl font-mono-accent font-bold text-[var(--color-text-secondary)]">?</span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">Not connected</p>
        <button className="btn-accent mt-3 px-6 py-2.5 rounded-lg flex items-center gap-2">
          <Wallet size={16} />
          Connect Wallet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-y border-[var(--color-border)]">
        <div className="py-4 text-center">
          <p className="text-lg font-semibold font-mono-accent">0</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Listings</p>
        </div>
        <div className="py-4 text-center border-x border-[var(--color-border)]">
          <p className="text-lg font-semibold font-mono-accent">0</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Sales</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-lg font-semibold font-mono-accent">0</p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Purchases</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mt-4">
        {[
          { icon: Package, label: 'My Listings', desc: 'Manage your items' },
          { icon: Heart, label: 'Saved Items', desc: 'Items you liked' },
          { icon: Wallet, label: 'Wallet', desc: 'View balances & transactions' },
          { icon: Settings, label: 'Settings', desc: 'Account preferences' },
        ].map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 py-4 border-b border-[var(--color-border)] hover:bg-gray-50 transition-colors text-left"
          >
            <Icon size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
