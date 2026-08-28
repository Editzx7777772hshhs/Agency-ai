import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const toast = {
    success: (msg, duration) => notify(msg, 'success', duration),
    error: (msg, duration) => notify(msg, 'error', duration),
    info: (msg, duration) => notify(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="glass rounded-xl px-4 py-3 flex items-start gap-3 shadow-card animate-in fade-in slide-in-from-bottom-2"
          >
            {t.type === 'success' && <CheckCircle2 size={18} className="text-vsuccess mt-0.5 shrink-0" />}
            {t.type === 'error' && <XCircle size={18} className="text-vdanger mt-0.5 shrink-0" />}
            {t.type === 'info' && <Info size={18} className="text-vaccent-soft mt-0.5 shrink-0" />}
            <p className="text-sm text-vtext flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-vtext-faint hover:text-vtext transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
