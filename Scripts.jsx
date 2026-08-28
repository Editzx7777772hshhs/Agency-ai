import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FileText, Save } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { ProjectSelector } from '../components/ProjectSelector'
import { EmptyState } from '../components/EmptyState'
import { ScriptEditor } from '../components/ScriptEditor'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../components/Toast'
import { generateScript } from '../services/scriptAgent'
import { ApiError } from '../lib/api'
import { supabase } from '../lib/supabase'

const DURATIONS = ['15 seconds', '30 seconds', '60 seconds', '3 minutes', '5 minutes', '10 minutes']

export default function Scripts() {
  const location = useLocation()
  const prefill = location.state || {}
  const { projects, loading: projectsLoading } = useProjects()
  const toast = useToast()

  const [projectId, setProjectId] = useState(prefill.projectId || '')
  const [ideaTitle, setIdeaTitle] = useState(prefill.idea?.title || '')
  const [ideaHook, setIdeaHook] = useState(prefill.idea?.hook || '')
  const [ideaAngle, setIdeaAngle] = useState(prefill.idea?.angle || '')
  const [duration, setDuration] = useState(DURATIONS[1])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [script, setScript] = useState(null)

  const project = projects.find((p) => p.id === projectId)

  async function handleGenerate() {
    if (!project || !ideaTitle.trim()) {
      setError('Select a project and describe the content idea.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await generateScript({
        projectId: project.id,
        ideaId: prefill.idea?.id || null,
        ideaTitle: ideaTitle.trim(),
        ideaHook: ideaHook.trim(),
        ideaAngle: ideaAngle.trim(),
        duration,
        platform: project.platform,
        tone: project.tone,
      })
      setScript(data)
      toast.success('Script generated')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not generate script. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!script || !project) return
    setSaving(true)
    try {
      const { error } = await supabase.from('scripts').insert({
        project_id: project.id,
        idea_id: prefill.idea?.id || null,
        title: script.title || ideaTitle,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        duration,
      })
      if (error) throw error
      toast.success('Script saved')
    } catch (err) {
      toast.error(err.message || 'Could not save script.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title="Scripts">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <div className="glass rounded-xl2 p-5 shadow-card h-fit space-y-4">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2">
            <FileText size={15} className="text-vaccent-soft" /> Script setup
          </h2>

          {projectsLoading ? (
            <p className="text-sm text-vtext-muted">Loading projects…</p>
          ) : (
            <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} />
          )}

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Content idea / title</label>
            <input
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              placeholder="What is this video about?"
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Hook idea <span className="text-vtext-faint">(optional)</span></label>
            <input
              value={ideaHook}
              onChange={(e) => setIdeaHook(e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Angle <span className="text-vtext-faint">(optional)</span></label>
            <input
              value={ideaAngle}
              onChange={(e) => setIdeaAngle(e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            >
              {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <GenerateButton onClick={handleGenerate} loading={loading} disabled={!project} className="w-full">
            Generate Script
          </GenerateButton>

          <ErrorNotice message={error} onRetry={handleGenerate} />
        </div>

        <div>
          {!script && !loading && (
            <EmptyState
              icon={FileText}
              title="No script yet"
              description="Fill in the idea details and generate a full hook-to-CTA script, ready to edit."
            />
          )}

          {loading && <div className="glass rounded-xl2 p-5 animate-pulse-slow h-96" />}

          {script && !loading && (
            <div className="space-y-4">
              <ScriptEditor script={script} onChange={setScript} />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-vborder disabled:opacity-50 transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold"
              >
                <Save size={15} />
                {saving ? 'Saving…' : 'Save script'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
