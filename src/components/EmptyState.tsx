import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

export default function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <Icon size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
      <p className="text-lg font-medium mb-1">{title}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
    </div>
  )
}
