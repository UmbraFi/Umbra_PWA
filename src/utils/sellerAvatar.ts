const avatarPalette = ['#111827', '#1F2937', '#0F172A', '#334155', '#3F3F46', '#27272A']

const getSellerAvatarSeed = (seller: string) =>
  seller.split('').reduce((seed, char) => seed + char.charCodeAt(0), 0)

export const getSellerAvatarColor = (seller: string) =>
  avatarPalette[getSellerAvatarSeed(seller) % avatarPalette.length]

export const getSellerAvatarLabel = (seller: string) => {
  const compact = seller.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (compact.length >= 2) return compact.slice(0, 2)
  return seller.slice(0, 2).toUpperCase()
}
