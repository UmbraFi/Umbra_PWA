export const APP_ROUTE_PATHS = {
  home: '/',
  discover: '/discover',
  sell: '/sell',
  messages: '/messages',
  profile: '/profile',
  cart: '/cart',
  feedTags: '/feed-tags',
  product: '/product/:id',
  seller: '/seller/:sellerId',
  chat: '/chat/:chatId',
  drafts: '/drafts',
  addresses: '/addresses',
  myListings: '/my-listings',
  mySpace: '/my-space',
  mySales: '/my-sales',
  myPurchases: '/my-purchases',
  browsingHistory: '/browsing-history',
  favorites: '/favorites',
  followedStores: '/followed-stores',
  settings: '/settings',
  aiSupport: '/ai-support',
} as const

export const APP_ROUTE_PREFIXES = {
  product: '/product',
  seller: '/seller',
  chat: '/chat',
} as const

export const toProductPath = (productId: string) =>
  `${APP_ROUTE_PREFIXES.product}/${encodeURIComponent(productId)}`

export const toSellerPath = (sellerId: string) =>
  `${APP_ROUTE_PREFIXES.seller}/${encodeURIComponent(sellerId)}`
