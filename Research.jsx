import { useState } from 'react'
import { Search, Sparkles, TrendingUp, Target, Lightbulb, Flame, Users2, BadgeInfo } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { ProjectSelector } from '../components/ProjectSelector'
import { EmptyState } from '../components/EmptyState'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../components/Toast'
import { runResearch } from '../services/researchAgent'
import { ApiError } from '../lib/api'

export default function Research() {
  const { projects, loading: projectsLoading } = useProjects()
  const toast = useToast()
  const [projectId, setProjectId] = useState('')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const project = projects.find((p) => p.id === projectId)

  async function handleGenerate() {
    if (!projectId || !topic.trim()) {
      setError('Select a project and enter a topic to research.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await runResearch({
        projectId,
        topic: topic.trim(),
        audience: audience.trim() || project?.target_audience || '',
        platform: project?.platform || '',
      })
      setResult(data)
      toast.success('Research complete')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Research failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Research">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="glass rounded-xl2 p-5 shadow-card h-fit space-y-4">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2">
            <Search size={15} className="text-vaccent-soft" /> Research inputs
          </h2>

          {projectsLoading ? (
            <p className="text-sm text-vtext-muted">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-vtext-muted">Create a project first from the Dashboard.</p>
          ) : (
            <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} />
          )}

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Speedrun world records in 2026"
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">
              Audience <span className="text-vtext-faint">(optional — uses project default)</span>
            </label>
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              rows={2}
              placeholder={project?.target_audience || 'Who is this for?'}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none resize-none"
            />
          </div>

          <GenerateButton onClick={handleGenerate} loading={loading} disabled={projects.length === 0} className="w-full">
            Generate Research
          </GenerateButton>

          <ErrorNotice message={error} onRetry={handleGenerate} />
        </div>

        <div>
          {!result && !loading && (
            <EmptyState
              icon={Search}
              title="No research yet"
              description="Pick a project, give it a topic, and VANTA will surface angles, hooks, and content opportunities."
            />
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl2 p-5 animate-pulse-slow h-32" />
              ))}
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {result.source && (
                <div className="flex items-center gap-2 text-xs text-vtext-faint">
                  <BadgeInfo size={13} />
                  {result.source === 'verified'
                    ? 'Includes verified external sources'
                    : 'AI-generated analysis — not pulled from live web data'}
                </div>
              )}

              <ResultCard icon={Lightbulb} title="Topic summary">
                <p className="text-sm text-vtext-muted leading-relaxed">{result.summary}</p>
              </ResultCard>

              <div className="grid sm:grid-cols-2 gap-4">
                <ResultCard icon={Users2} title="Audience pain points" list={result.painPoints} />
                <ResultCard icon={TrendingUp} title="Content opportunities" list={result.opportunities} />
                <ResultCard icon={Target} title="Possible angles" list={result.angles} />
                <ResultCard icon={Flame} title="Hook ideas" list={result.hooks} />
              </div>

              <ResultCard icon={Sparkles} title="Competitor / content patterns" list={result.patterns} />
              <ResultCard icon={Search} title="Suggested topics" list={result.suggestedTopics} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function ResultCard({ icon: Icon, title, children, list }) {
  return (
    <div className="glass rounded-xl2 p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-display font-semibold text-sm mb-3">
        <Icon size={15} className="text-vaccent-soft" /> {title}
      </h3>
      {children}
      {list && (
        <ul className="space-y-1.5">
          {(list || []).map((item, i) => (
            <li key={i} className="text-sm text-vtext-muted flex gap-2">
              <span className="text-vaccent-soft mt-1.5 w-1 h-1 rounded-full bg-vaccent-soft shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
