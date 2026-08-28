import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Lightbulb, FileText, Mic, Clapperboard,
  Tags, CalendarDays, BarChart3, Settings, X, Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/research', label: 'Research', icon: Search },
  { to: '/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/scripts', label: 'Scripts', icon: FileText },
  { to: '/voice', label: 'Voice', icon: Mic },
  { to: '/videos', label: 'Videos', icon: Clapperboard },
  { to: '/metadata', label: 'Metadata', icon: Tags },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
              isActive
                ? 'bg-vaccent/15 text-white shadow-glow'
                : 'text-vtext-muted hover:bg-white/5 hover:text-vtext'
            }`
          }
        >
          <Icon size={18} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-vborder bg-black/20">
      <div className="flex items-center gap-2 px-5 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vaccent to-vaccent-glow flex items-center justify-center">
          <Sparkles size={16} className="text-black" />
        </div>
        <span className="font-display font-semibold tracking-tight">VANTA AI</span>
      </div>
      <NavItems />
      <div className="p-4 text-xs text-vtext-faint">v0.1.0 · MVP</div>
    </aside>
  )
}

export function MobileDrawer({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-vbg border-r border-vborder flex flex-col transition-transform md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vaccent to-vaccent-glow flex items-center justify-center">
              <Sparkles size={16} className="text-black" />
            </div>
            <span className="font-display font-semibold tracking-tight">VANTA AI</span>
          </div>
          <button onClick={onClose} className="text-vtext-muted hover:text-vtext focus-ring rounded p-1" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <NavItems onNavigate={onClose} />
      </aside>
    </>
  )
}
