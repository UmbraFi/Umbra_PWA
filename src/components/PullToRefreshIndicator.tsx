import { motion, type MotionValue } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface Props {
  pullY: MotionValue<number>
  rotation: MotionValue<number>
  opacity: MotionValue<number>
  scale: MotionValue<number>
  isRefreshing: boolean
}

export default function PullToRefreshIndicator({ pullY, rotation, opacity, scale, isRefreshing }: Props) {
  return (
    <motion.div
      className="flex items-center justify-center overflow-hidden"
      style={{ height: pullY }}
    >
      <motion.div
        style={{
          rotate: isRefreshing ? undefined : rotation,
          opacity,
          scale,
        }}
        animate={isRefreshing ? { rotate: 360 } : undefined}
        transition={isRefreshing ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : undefined}
      >
        <Loader2
          size={20}
          strokeWidth={2}
          className="text-[var(--color-text-secondary)]"
        />
      </motion.div>
    </motion.div>
  )
}
