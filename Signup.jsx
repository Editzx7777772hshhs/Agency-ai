import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../components/Toast'

export default function Signup() {
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (form.password.length < 8) e.password = 'Use at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.name)
      setDone(true)
      toast.success('Account created! Check your email to confirm.')
    } catch (err) {
      toast.error(err.message || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-xl2 p-8 max-w-sm text-center">
          <h1 className="font-display font-semibold text-xl mb-2">Check your inbox</h1>
          <p className="text-sm text-vtext-muted mb-5">
            We sent a confirmation link to <span className="text-vtext">{form.email}</span>. Confirm your email, then sign in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-vaccent hover:bg-vaccent-soft transition-colors rounded-lg py-2.5 text-sm font-semibold"
          >
            Go to sign in
          </button>
        </div>
      </div>
    )
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
          <h1 className="font-display font-semibold text-xl mb-1">Create your account</h1>
          <p className="text-sm text-vtext-muted mb-6">Start automating your content pipeline.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-vtext-muted mb-1.5">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
                placeholder="Jamie Rivera"
              />
              {errors.name && <p className="text-xs text-vdanger mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-vtext-muted mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
                placeholder="you@studio.com"
              />
              {errors.email && <p className="text-xs text-vdanger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-vtext-muted mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              />
              {errors.password && <p className="text-xs text-vdanger mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-lg py-2.5 text-sm font-semibold"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-vtext-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-vaccent-soft hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
