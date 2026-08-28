import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../components/Toast'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass rounded-xl2 p-6 shadow-card">
          <Link to="/login" className="flex items-center gap-1 text-xs text-vtext-muted hover:text-vtext mb-4">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
          <h1 className="font-display font-semibold text-xl mb-1">Reset your password</h1>
          <p className="text-sm text-vtext-muted mb-6">
            {sent
              ? `We sent a reset link to ${email}. Follow it to set a new password.`
              : "We'll email you a link to set a new password."}
          </p>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
                placeholder="you@studio.com"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft disabled:opacity-60 transition-colors rounded-lg py-2.5 text-sm font-semibold"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
