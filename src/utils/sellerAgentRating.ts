import type { Product } from '../data/mockProducts'

export interface SellerAgentMetric {
  key: 'transactions' | 'items' | 'reviews' | 'stake'
  label: string
  valueLabel: string
  detail: string
  score: number
}

export interface SellerAgentRating {
  overallScore: number
  grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B'
  confidenceLabel: 'High confidence' | 'Medium confidence' | 'Early signal'
  summary: string
  ratedAt: string
  transactionCount: number
  activeItems: number
  categoryCount: number
  buyerRating: number
  buyerReviewCount: number
  stakeAmount: number
  metrics: SellerAgentMetric[]
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

const hashString = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index)
  }
  return Math.abs(hash)
}

const getGrade = (score: number): SellerAgentRating['grade'] => {
  if (score >= 92) return 'AAA'
  if (score >= 86) return 'AA'
  if (score >= 80) return 'A'
  if (score >= 72) return 'BBB'
  if (score >= 64) return 'BB'
  return 'B'
}

const getConfidenceLabel = (transactionCount: number): SellerAgentRating['confidenceLabel'] => {
  if (transactionCount >= 240) return 'High confidence'
  if (transactionCount >= 160) return 'Medium confidence'
  return 'Early signal'
}

const getSummary = (score: number, categoryCount: number, buyerRating: number, stakeAmount: number) => {
  if (score >= 88) {
    return `Strong cross-category activity, ${buyerRating.toFixed(1)}/5 buyer sentiment, and ${stakeAmount.toFixed(1)} SOL staked support.`
  }

  if (score >= 76) {
    return `Healthy trade history across ${categoryCount} categories with dependable buyer feedback and stake backing.`
  }

  return `Emerging seller profile with growing activity, acceptable reviews, and room to deepen stake coverage.`
}

export function getSellerAgentRating(sellerId: string, sellerProducts: Product[]): SellerAgentRating {
  const hash = hashString(sellerId)
  const activeItems = sellerProducts.length
  const categoryCount = new Set(sellerProducts.map((product) => product.category)).size || 1
  const totalVolume = sellerProducts.reduce((sum, product) => sum + product.price, 0)
  const avgReputation = average(sellerProducts.map((product) => product.sellerReputation)) || 72
  const avgQuality = average(sellerProducts.map((product) => product.qualityScore)) || 75

  const transactionCount = Math.round(
    activeItems * 14 +
    categoryCount * 10 +
    totalVolume * 6 +
    avgReputation * 1.15 +
    (hash % 72),
  )

  const buyerRating = Number(
    clamp(3.8 + (avgReputation - 70) * 0.03 + (hash % 11) * 0.035, 3.8, 5).toFixed(1),
  )

  const buyerReviewCount = Math.round(transactionCount * 0.62 + activeItems * 4 + (hash % 21))
  const stakeAmount = Number(
    (18 + totalVolume * 3.5 + activeItems * 6 + categoryCount * 4 + (hash % 44) * 0.5).toFixed(1),
  )

  const transactionScore = clamp(transactionCount / 3.5, 0, 100)
  const itemScore = clamp(activeItems * 7 + categoryCount * 8 + (avgQuality - 60) * 0.6, 0, 100)
  const reviewScore = clamp((buyerRating / 5) * 100, 0, 100)
  const stakeScore = clamp(stakeAmount / 1.2, 0, 100)

  const overallScore = Math.round(
    transactionScore * 0.3 +
    itemScore * 0.2 +
    reviewScore * 0.3 +
    stakeScore * 0.2,
  )

  const latestActivity = sellerProducts.reduce((latest, product) => {
    const timestamp = new Date(product.listedAt).getTime()
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest
  }, 0)

  const ratedAtTime = latestActivity
    ? Math.min(Date.now(), latestActivity + ((hash % 18) + 3) * 60 * 60 * 1000)
    : Date.now()

  const ratedAt = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(ratedAtTime))

  const metrics: SellerAgentMetric[] = [
    {
      key: 'transactions',
      label: 'Transactions',
      valueLabel: `${transactionCount}`,
      detail: 'Historical completed trades linked to this address',
      score: Math.round(transactionScore),
    },
    {
      key: 'items',
      label: 'Items traded',
      valueLabel: `${activeItems} active / ${categoryCount} categories`,
      detail: 'Diversity and frequency of listed item flows',
      score: Math.round(itemScore),
    },
    {
      key: 'reviews',
      label: 'Buyer reviews',
      valueLabel: `${buyerRating.toFixed(1)} / 5`,
      detail: `${buyerReviewCount} buyer feedback signals sampled`,
      score: Math.round(reviewScore),
    },
    {
      key: 'stake',
      label: 'Stake depth',
      valueLabel: `${stakeAmount.toFixed(1)} SOL`,
      detail: 'Committed stake available as trust collateral',
      score: Math.round(stakeScore),
    },
  ]

  return {
    overallScore,
    grade: getGrade(overallScore),
    confidenceLabel: getConfidenceLabel(transactionCount),
    summary: getSummary(overallScore, categoryCount, buyerRating, stakeAmount),
    ratedAt,
    transactionCount,
    activeItems,
    categoryCount,
    buyerRating,
    buyerReviewCount,
    stakeAmount,
    metrics,
  }
}
