import { useState } from 'react'
import { User, Zap, KeyRound, LogOut } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const PLAN_LIMITS = { free: 5, creator: 100, pro: 500, agency: null }

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const plan = profile?.plan || 'free'
  const limit = PLAN_LIMITS[plan]

  async function handleSaveName() {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ name }).eq('user_id', user.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setChangingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      toast.success('Password updated')
    } catch (err) {
      toast.error(err.message || 'Could not update password.')
    } finally {
      setChangingPw(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <section className="glass rounded-xl2 p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-display font-semibold text-sm mb-4">
            <User size={15} className="text-vaccent-soft" /> Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm text-vtext-faint cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="bg-vaccent hover:bg-vaccent-soft disabled:opacity-50 transition-colors rounded-lg px-4 py-2 text-sm font-semibold"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </section>

        <section className="glass rounded-xl2 p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-display font-semibold text-sm mb-4">
            <Zap size={15} className="text-vaccent-soft" /> Plan & usage
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-vtext-muted capitalize">{plan} plan</span>
            <span className="text-xs text-vtext-faint">
              {limit ? `${limit} generations / month` : 'Custom limit'}
            </span>
          </div>
          <p className="text-xs text-vtext-faint">
            Usage tracking is wired up for future billing — plan enforcement and payments aren't active in this MVP.
          </p>
        </section>

        <section className="glass rounded-xl2 p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-display font-semibold text-sm mb-4">
            <KeyRound size={15} className="text-vaccent-soft" /> Password
          </h2>
          <div className="flex gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            />
            <button
              onClick={handleChangePassword}
              disabled={changingPw}
              className="bg-white/5 hover:bg-white/10 border border-vborder disabled:opacity-50 transition-colors rounded-lg px-4 py-2 text-sm font-semibold shrink-0"
            >
              {changingPw ? 'Updating…' : 'Update'}
            </button>
          </div>
        </section>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-vdanger hover:underline"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </AppShell>
  )
}
