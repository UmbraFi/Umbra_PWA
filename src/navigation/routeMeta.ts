import { APP_ROUTE_PATHS, APP_ROUTE_PREFIXES } from './paths'

export type RouteKind = 'home' | 'tab' | 'stack'

export interface RouteMeta {
  key: string
  title: string
  kind: RouteKind
  showBottomNav: boolean
  showExitButton: boolean
  showNavbar: boolean
}

export interface TabItem {
  to: string
  label: string
}

export const tabItems: TabItem[] = [
  { to: APP_ROUTE_PATHS.home, label: 'Picks' },
  { to: APP_ROUTE_PATHS.discover, label: 'Follow' },
  { to: APP_ROUTE_PATHS.sell, label: 'Sell' },
  { to: APP_ROUTE_PATHS.messages, label: 'Messages' },
  { to: APP_ROUTE_PATHS.profile, label: 'Profile' },
]

const HOME_ROUTE: RouteMeta = {
  key: 'home',
  title: 'UMBRAFI',
  kind: 'home',
  showBottomNav: true,
  showExitButton: false,
  showNavbar: true,
}

const TAB_ROUTES: Record<string, RouteMeta> = {
  [APP_ROUTE_PATHS.discover]: {
    key: 'follow',
    title: 'Follow',
    kind: 'tab',
    showBottomNav: true,
    showExitButton: false,
    showNavbar: true,
  },
  [APP_ROUTE_PATHS.sell]: {
    key: 'sell',
    title: 'Sell',
    kind: 'tab',
    showBottomNav: true,
    showExitButton: false,
    showNavbar: false,
  },
  [APP_ROUTE_PATHS.messages]: {
    key: 'messages',
    title: 'Messages',
    kind: 'tab',
    showBottomNav: true,
    showExitButton: false,
    showNavbar: false,
  },
  [APP_ROUTE_PATHS.profile]: {
    key: 'profile',
    title: 'Profile',
    kind: 'tab',
    showBottomNav: true,
    showExitButton: false,
    showNavbar: false,
  },
}

const STACK_ROUTES: Record<string, RouteMeta> = {
  [APP_ROUTE_PATHS.feedTags]: {
    key: 'feed-tags',
    title: 'Tag Filters',
    kind: 'tab',
    showBottomNav: false,
    showExitButton: false,
    showNavbar: false,
  },
}

const PREFIX_ROUTES: Array<{ prefix: string; meta: RouteMeta }> = [
  {
    prefix: APP_ROUTE_PREFIXES.product,
    meta: {
      key: 'product',
      title: 'Product',
      kind: 'stack',
      showBottomNav: false,
      showExitButton: true,
      showNavbar: false,
    },
  },
  {
    prefix: APP_ROUTE_PREFIXES.seller,
    meta: {
      key: 'seller',
      title: 'Seller',
      kind: 'stack',
      showBottomNav: false,
      showExitButton: true,
      showNavbar: false,
    },
  },
  {
    prefix: APP_ROUTE_PREFIXES.chat,
    meta: {
      key: 'chat',
      title: 'Chat',
      kind: 'stack',
      showBottomNav: false,
      showExitButton: true,
      showNavbar: false,
    },
  },
]

const FALLBACK_ROUTE: RouteMeta = {
  key: 'fallback',
  title: 'UMBRAFI',
  kind: 'stack',
  showBottomNav: false,
  showExitButton: true,
  showNavbar: false,
}

export const normalizePathname = (pathname: string) =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

const isPathOrChild = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

export const resolveRouteMeta = (pathname: string): RouteMeta => {
  const normalized = normalizePathname(pathname)

  if (normalized === APP_ROUTE_PATHS.home) {
    return HOME_ROUTE
  }

  if (normalized in TAB_ROUTES) {
    return TAB_ROUTES[normalized]
  }

  if (normalized in STACK_ROUTES) {
    return STACK_ROUTES[normalized]
  }

  for (const { prefix, meta } of PREFIX_ROUTES) {
    if (isPathOrChild(normalized, prefix)) {
      return meta
    }
  }

  return FALLBACK_ROUTE
}
