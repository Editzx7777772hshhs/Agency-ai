import { useEffect, useState } from 'react'
import { BarChart3, Plus, TrendingUp, TrendingDown, Lightbulb, Target } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { ProjectSelector } from '../components/ProjectSelector'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { analyzePerformance } from '../services/analyticsAgent'
import { ApiError } from '../lib/api'

const EMPTY_FORM = { views: '', likes: '', comments: '', shares: '', watch_time: '' }

export default function Analytics() {
  const { projects } = useProjects()
  const toast = useToast()
  const [projectId, setProjectId] = useState('')
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    if (projectId) loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function loadEntries() {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error) setEntries(data || [])
  }

  async function handleAddEntry() {
    if (!projectId) return
    const payload = {
      project_id: projectId,
      views: Number(form.views) || 0,
      likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0,
      shares: Number(form.shares) || 0,
      watch_time: Number(form.watch_time) || 0,
    }
    const { data, error } = await supabase.from('analytics').insert(payload).select().single()
    if (error) return toast.error(error.message)
    setEntries((prev) => [data, ...prev])
    setForm(EMPTY_FORM)
    toast.success('Entry logged')
  }

  async function handleAnalyze() {
    if (entries.length === 0) {
      setError('Log at least one entry with real numbers before analyzing.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await analyzePerformance({ projectId, entries })
      setAnalysis(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Analysis failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const totals = entries.reduce(
    (acc, e) => ({
      views: acc.views + (e.views || 0),
      likes: acc.likes + (e.likes || 0),
      comments: acc.comments + (e.comments || 0),
      shares: acc.shares + (e.shares || 0),
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 }
  )
  const engagementRate = totals.views > 0
    ? (((totals.likes + totals.comments + totals.shares) / totals.views) * 100).toFixed(1)
    : '0.0'

  return (
    <AppShell title="Analytics">
      <div className="max-w-xs mb-6">
        <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} />
      </div>

      {!projectId ? (
        <EmptyState icon={BarChart3} title="Select a project" description="Choose a project to log performance numbers and get AI-backed recommendations." />
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-6">
            <div className="glass rounded-xl2 p-5 shadow-card">
              <h3 className="font-display font-semibold text-sm mb-3">Log a result</h3>
              <div className="grid grid-cols-2 gap-3">
                {['views', 'likes', 'comments', 'shares', 'watch_time'].map((field) => (
                  <div key={field}>
                    <label className="block text-[11px] text-vtext-faint mb-1 capitalize">{field.replace('_', ' ')}</label>
                    <input
                      type="number"
                      min="0"
                      value={form[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="w-full bg-white/5 border border-vborder rounded-lg px-2.5 py-2 text-sm focus-ring outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddEntry}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-vborder transition-colors rounded-lg py-2 text-sm font-medium"
              >
                <Plus size={14} /> Log entry
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total views" value={totals.views.toLocaleString()} />
              <Stat label="Engagement rate" value={`${engagementRate}%`} />
            </div>

            <GenerateButton onClick={handleAnalyze} loading={loading} disabled={entries.length === 0} className="w-full">
              Analyze performance
            </GenerateButton>
            <ErrorNotice message={error} onRetry={handleAnalyze} />
          </div>

          <div className="space-y-4">
            {entries.length === 0 && !analysis && (
              <EmptyState
                icon={BarChart3}
                title="No performance data yet"
                description="Enter your real view/like/comment numbers — VANTA only analyzes what you actually provide, never invented platform data."
              />
            )}

            {analysis && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnalysisCard icon={TrendingUp} title="What worked" list={analysis.whatWorked} color="vsuccess" />
                  <AnalysisCard icon={TrendingDown} title="What didn't work" list={analysis.whatDidNotWork} color="vdanger" />
                </div>
                <AnalysisCard icon={Lightbulb} title="Possible reasons" list={analysis.possibleReasons} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnalysisCard icon={Target} title="Recommended improvements" list={analysis.improvements} />
                  <AnalysisCard icon={BarChart3} title="Recommended next topics" list={analysis.nextTopics} />
                </div>
              </>
            )}

            {entries.length > 0 && (
              <div className="glass rounded-xl2 p-5 shadow-card">
                <h3 className="font-display font-semibold text-sm mb-3">Logged entries</h3>
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm text-vtext-muted border-b border-vborder/60 pb-2 last:border-0 last:pb-0">
                      <span>{new Date(e.created_at).toLocaleDateString()}</span>
                      <span>{e.views.toLocaleString()} views · {e.likes} likes · {e.comments} comments</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}

function Stat({ label, value }) {
  return (
    <div className="glass rounded-xl2 p-4 shadow-card">
      <p className="text-[11px] text-vtext-faint uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display font-semibold text-xl">{value}</p>
    </div>
  )
}

function AnalysisCard({ icon: Icon, title, list, color = 'vaccent-soft' }) {
  return (
    <div className="glass rounded-xl2 p-5 shadow-card">
      <h3 className={`flex items-center gap-2 font-display font-semibold text-sm mb-3 text-${color}`}>
        <Icon size={15} /> {title}
      </h3>
      <ul className="space-y-1.5">
        {(list || []).map((item, i) => (
          <li key={i} className="text-sm text-vtext-muted flex gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-vtext-faint shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
