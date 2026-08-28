import { Loader2, Sparkles } from 'lucide-react'

export function GenerateButton({ onClick, loading, disabled, children, icon: Icon = Sparkles, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      aria-busy={loading}
      className={`flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold shadow-glow ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      {loading ? 'Generating…' : children}
    </button>
  )
}

export function ErrorNotice({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-center justify-between gap-3 bg-vdanger/10 border border-vdanger/30 rounded-lg px-4 py-3 text-sm text-vdanger">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline shrink-0">
          Retry
        </button>
      )}
    </div>
  )
}
