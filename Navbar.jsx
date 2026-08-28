import { useState } from 'react'
import { Menu, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export function Navbar({ title, onMenuClick }) {
  const { profile, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initial = (profile?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-vborder bg-vbg/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-vtext-muted hover:text-vtext focus-ring rounded p-1"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-display font-semibold text-lg tracking-tight">{title}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors focus-ring"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vaccent to-vaccent-soft flex items-center justify-center text-sm font-semibold text-black">
            {initial}
          </div>
          <span className="hidden sm:block text-sm text-vtext-muted">{profile?.name || user?.email}</span>
          <ChevronDown size={14} className="text-vtext-faint" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-card z-20 py-1">
              <div className="px-3 py-2 border-b border-vborder">
                <p className="text-xs text-vtext-faint truncate">{user?.email}</p>
                <p className="text-xs text-vaccent-soft capitalize mt-0.5">{profile?.plan || 'free'} plan</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-vdanger hover:bg-white/5 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
