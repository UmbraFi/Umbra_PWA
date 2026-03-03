import { NavLink, useLocation } from 'react-router-dom'
import { Flame, Users, PlusCircle, MessageCircle, User, type LucideIcon } from 'lucide-react'
import { normalizePathname, tabItems } from '../navigation/routeMeta'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import { lockScrollCapture, rememberScrollPosition, toScrollKey } from '../navigation/scrollMemory'
import { useStore } from '../store/useStore'

const iconByPath: Record<string, LucideIcon> = {
  [APP_ROUTE_PATHS.home]: Flame,
  [APP_ROUTE_PATHS.discover]: Users,
  [APP_ROUTE_PATHS.sell]: PlusCircle,
  [APP_ROUTE_PATHS.messages]: MessageCircle,
  [APP_ROUTE_PATHS.profile]: User,
}

const tabs = tabItems
  .map((item) => ({
    ...item,
    icon: iconByPath[item.to] ?? Flame,
  }))

export default function BottomNav() {
  const { pathname, search } = useLocation()
  const activePath = normalizePathname(pathname)
  const currentKey = toScrollKey(pathname, search)
  const bottomNavHidden = useStore((s) => s.bottomNavHidden)

  return (
    <nav
      className="liquid-tabbar-shell fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out"
      style={{
        paddingBottom: 'var(--liquid-tabbar-offset)',
        transform: bottomNavHidden ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      <div className="relative z-10 max-w-lg mx-auto px-4">
        <div className="liquid-tabbar pointer-events-auto rounded-full p-1.5">
          <div className="grid grid-cols-5 gap-1">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = activePath === to
              return (
                <NavLink
                  key={to}
                  to={to}
                  end
                  style={active ? { color: '#081C00' } : undefined}
                  onClick={(event) => {
                    if (navigator.vibrate) navigator.vibrate(8)
                    if (active) {
                      event.preventDefault()
                      rememberScrollPosition(currentKey, 0)
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
                      return
                    }

                    rememberScrollPosition(currentKey, window.scrollY)
                    lockScrollCapture()
                  }}
                  className={`tap-feedback flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 transition-all ${
                    active
                      ? 'liquid-tab-item-active'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Icon size={active ? 18 : 17} strokeWidth={active ? 2.2 : 1.8} />
                  <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
