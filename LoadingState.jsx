import { Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Loading…', size = 'md' }) {
  const sizes = { sm: 14, md: 20, lg: 28 }
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-vtext-muted">
      <Loader2 size={sizes[size]} className="animate-spin text-vaccent-soft" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function InlineSpinner({ size = 14 }) {
  return <Loader2 size={size} className="animate-spin" />
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl2 p-5 animate-pulse-slow">
      <div className="h-3 w-1/3 bg-white/10 rounded mb-3" />
      <div className="h-2 w-full bg-white/5 rounded mb-2" />
      <div className="h-2 w-5/6 bg-white/5 rounded" />
    </div>
  )
}
