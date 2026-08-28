import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FolderKanban, Lightbulb, FileText, CalendarClock, Sparkles, ArrowRight,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { DashboardCard } from '../components/DashboardCard'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProjects } from '../hooks/useProjects'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { profile } = useAuth()
  const { projects, loading, createProject } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [stats, setStats] = useState({ ideas: 0, scripts: 0, scheduled: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!projects.length) {
      setStatsLoading(false)
      return
    }
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  async function loadStats() {
    setStatsLoading(true)
    const projectIds = projects.map((p) => p.id)
    const [ideasRes, scriptsRes, scheduledRes] = await Promise.all([
      supabase.from('content_ideas').select('id', { count: 'exact', head: true }).in('project_id', projectIds),
      supabase.from('scripts').select('id', { count: 'exact', head: true }).in('project_id', projectIds),
      supabase.from('content_calendar').select('id', { count: 'exact', head: true }).in('project_id', projectIds).eq('status', 'Scheduled'),
    ])
    setStats({
      ideas: ideasRes.count || 0,
      scripts: scriptsRes.count || 0,
      scheduled: scheduledRes.count || 0,
    })
    setStatsLoading(false)
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-semibold text-2xl mb-1">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h2>
          <p className="text-sm text-vtext-muted">Here's what's happening across your content pipeline.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold shadow-glow shrink-0"
        >
          <Sparkles size={16} />
          Create New Content
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard icon={FolderKanban} label="Total Projects" value={loading ? '—' : projects.length} accent="vaccent" />
        <DashboardCard icon={Lightbulb} label="Content Ideas" value={statsLoading ? '—' : stats.ideas} accent="vwarn" />
        <DashboardCard icon={FileText} label="Scripts Created" value={statsLoading ? '—' : stats.scripts} accent="vsuccess" />
        <DashboardCard icon={CalendarClock} label="Scheduled" value={statsLoading ? '—' : stats.scheduled} accent="vdanger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-base">Recent projects</h3>
            {projects.length > 0 && (
              <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 text-xs text-vaccent-soft hover:underline">
                <Plus size={14} /> New project
              </button>
            )}
          </div>

          {loading ? (
            <LoadingState label="Loading projects…" />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to start generating research, ideas, and scripts."
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-vaccent hover:bg-vaccent-soft transition-colors rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  <Plus size={16} /> Create Project
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 6).map((p) => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-vtext-muted truncate">{p.niche} · {p.platform} · {p.tone}</p>
                  </div>
                  <button
                    onClick={() => navigate('/ideas')}
                    className="shrink-0 flex items-center gap-1 text-xs text-vaccent-soft hover:underline"
                  >
                    Generate ideas <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display font-semibold text-base mb-3">Quick actions</h3>
          <div className="space-y-3">
            <QuickAction label="Run research" desc="Uncover angles & hooks" onClick={() => navigate('/research')} />
            <QuickAction label="Generate ideas" desc="10 fresh concepts" onClick={() => navigate('/ideas')} />
            <QuickAction label="Write a script" desc="Hook to CTA" onClick={() => navigate('/scripts')} />
            <QuickAction label="Plan calendar" desc="Schedule content" onClick={() => navigate('/calendar')} />
          </div>
        </div>
      </div>

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={createProject} />
    </AppShell>
  )
}

function QuickAction({ label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between glass rounded-xl p-4 hover:border-white/20 transition-colors text-left"
    >
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-vtext-muted">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-vtext-faint" />
    </button>
  )
}
