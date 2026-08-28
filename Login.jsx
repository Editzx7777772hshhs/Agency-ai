import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../components/Toast'

export default function Login() {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Could not sign in. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vaccent to-vaccent-glow flex items-center justify-center">
            <Sparkles size={18} className="text-black" />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">VANTA AI</span>
        </div>

        <div className="glass rounded-xl2 p-6 shadow-card">
          <h1 className="font-display font-semibold text-xl mb-1">Welcome back</h1>
          <p className="text-sm text-vtext-muted mb-6">Sign in to keep shipping content.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-vtext-muted mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none placeholder:text-vtext-faint"
                placeholder="you@studio.com"
              />
              {errors.email && <p className="text-xs text-vdanger mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-vtext-muted">Password</label>
                <Link to="/forgot-password" className="text-xs text-vaccent-soft hover:underline">Forgot?</Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              />
              {errors.password && <p className="text-xs text-vdanger mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-lg py-2.5 text-sm font-semibold text-white"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-vtext-muted mt-5">
          New to VANTA?{' '}
          <Link to="/signup" className="text-vaccent-soft hover:underline font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
