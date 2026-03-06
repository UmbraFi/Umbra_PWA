import { useEffect, useRef, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      if (!containerRef.current) return
      // Position container exactly over the visual viewport
      // so fixed-position content and cursor stay aligned
      containerRef.current.style.top = `${vv.offsetTop}px`
      containerRef.current.style.height = `${vv.height}px`
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open])

  if (!open) return null

  const vv = window.visualViewport

  return (
    <div
      ref={containerRef}
      className="fixed left-0 right-0 z-50 flex items-end justify-center bg-black/40"
      style={{
        top: vv?.offsetTop ?? 0,
        height: vv?.height ?? window.innerHeight,
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-5 pb-8 animate-slide-up relative after:absolute after:left-0 after:right-0 after:top-full after:h-screen after:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
