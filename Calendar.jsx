import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'

const STATUSES = ['Idea', 'Writing', 'Ready', 'Scheduled', 'Published']
const STATUS_COLOR = {
  Idea: 'bg-vtext-faint/20 text-vtext-muted',
  Writing: 'bg-vwarn/20 text-vwarn',
  Ready: 'bg-vaccent/20 text-vaccent-soft',
  Scheduled: 'bg-vaccent-glow/20 text-vaccent-glow',
  Published: 'bg-vsuccess/20 text-vsuccess',
}
const PLATFORMS = ['YouTube', 'YouTube Shorts', 'Instagram', 'TikTok', 'Facebook']

export default function CalendarPage() {
  const { projects } = useProjects()
  const toast = useToast()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalDate, setModalDate] = useState(null)

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, projects.length])

  async function loadItems() {
    if (projects.length === 0) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString()
    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .in('project_id', projects.map((p) => p.id))
      .gte('scheduled_date', start)
      .lt('scheduled_date', end)
    if (!error) setItems(data || [])
    setLoading(false)
  }

  async function addItem(payload) {
    try {
      const { data, error } = await supabase.from('content_calendar').insert(payload).select().single()
      if (error) throw error
      setItems((prev) => [...prev, data])
      toast.success('Added to calendar')
    } catch (err) {
      toast.error(err.message || 'Could not add to calendar.')
    }
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('content_calendar').update({ status }).eq('id', id)
    if (error) return toast.error('Could not update status.')
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  async function removeItem(id) {
    const { error } = await supabase.from('content_calendar').delete().eq('id', id)
    if (error) return toast.error('Could not delete item.')
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const days = buildMonthGrid(month)

  return (
    <AppShell title="Calendar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-semibold text-lg">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg glass hover:border-white/20" aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg glass hover:border-white/20" aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create a project first, then schedule content on the calendar." />
      ) : loading ? (
        <LoadingState label="Loading calendar…" />
      ) : (
        <>
          <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-medium text-vtext-faint px-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {days.map((day, i) => {
              const dayItems = items.filter((it) => sameDay(new Date(it.scheduled_date), day.date))
              return (
                <div
                  key={i}
                  className={`glass rounded-xl p-2.5 min-h-[110px] flex flex-col gap-1.5 ${day.inMonth ? '' : 'opacity-40'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-vtext-faint">{day.date.getDate()}</span>
                    <button
                      onClick={() => setModalDate(day.date)}
                      className="text-vtext-faint hover:text-vaccent-soft transition-colors"
                      aria-label="Add content"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  {dayItems.map((it) => (
                    <div key={it.id} className="group relative">
                      <select
                        value={it.status}
                        onChange={(e) => updateStatus(it.id, e.target.value)}
                        className={`w-full text-[11px] rounded-md px-1.5 py-1 border-0 focus-ring outline-none ${STATUS_COLOR[it.status] || STATUS_COLOR.Idea}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s} · {it.platform}</option>)}
                      </select>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="absolute -right-1 -top-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-vdanger text-white"
                        aria-label="Remove"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}

      {modalDate && (
        <AddContentModal
          date={modalDate}
          projects={projects}
          onClose={() => setModalDate(null)}
          onAdd={(payload) => {
            addItem(payload)
            setModalDate(null)
          }}
        />
      )}
    </AppShell>
  )

  function shiftMonth(delta) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }
}

function AddContentModal({ date, projects, onClose, onAdd }) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [platform, setPlatform] = useState(PLATFORMS[0])
  const [status, setStatus] = useState('Idea')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass rounded-xl2 p-6 w-full max-w-sm shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">
            Add content — {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </h3>
          <button onClick={onClose} className="text-vtext-muted hover:text-vtext" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none">
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={() => onAdd({ project_id: projectId, scheduled_date: date.toISOString(), platform, status })}
            disabled={!projectId}
            className="w-full bg-vaccent hover:bg-vaccent-soft disabled:opacity-50 transition-colors rounded-lg py-2.5 text-sm font-semibold mt-2"
          >
            Add to calendar
          </button>
        </div>
      </div>
    </div>
  )
}

function buildMonthGrid(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = firstDay.getDay()
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return { date, inMonth: date.getMonth() === month.getMonth() }
  })
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
