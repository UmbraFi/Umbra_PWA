import { Link, useLocation } from 'react-router-dom'
import { Search, Bell, SlidersHorizontal, Boxes } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Navbar() {
  const { pathname } = useLocation()
  const products = useStore((s) => s.products)
  const isHome = pathname === '/'

  if (isHome) {
    return (
      <nav
        className="sticky top-0 z-50 bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-[-0.04em] font-mono-accent text-[var(--color-accent)]"
              style={{
                textShadow: '0 0 12px rgba(204, 255, 0, 0.4)',
              }}
            >
              UMBRA
            </span>
            <span className="text-[10px] font-mono-accent text-[var(--color-accent)] opacity-60 tracking-widest mt-0.5">
              ◆
            </span>
          </Link>

          {/* Right: item count + settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100">
              <Boxes size={14} strokeWidth={1.8} className="text-[var(--color-text-secondary)]" />
              <span className="text-xs font-mono-accent font-medium text-[var(--color-text)]">
                {products.length}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">on-chain</span>
            </div>
            <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
              <SlidersHorizontal size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className="sticky top-0 z-50 bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-[-0.04em] font-mono-accent">
          UMBRA
        </Link>

        <div className="flex items-center gap-5">
          <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            <Search size={22} strokeWidth={1.8} />
          </button>
          <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors relative">
            <Bell size={22} strokeWidth={1.8} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent)] rounded-full" />
          </button>
        </div>
      </div>
    </nav>
  )
}
