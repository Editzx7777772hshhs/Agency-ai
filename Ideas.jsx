import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { ProjectSelector } from '../components/ProjectSelector'
import { EmptyState } from '../components/EmptyState'
import { IdeaCard } from '../components/IdeaCard'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useProjects } from '../hooks/useProjects'
import { useToast } from '../components/Toast'
import { generateIdeas } from '../services/ideaAgent'
import { ApiError } from '../lib/api'
import { supabase } from '../lib/supabase'

export default function Ideas() {
  const { projects, loading: projectsLoading } = useProjects()
  const toast = useToast()
  const navigate = useNavigate()

  const [projectId, setProjectId] = useState('')
  const [ideas, setIdeas] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState(null)
  const [error, setError] = useState('')

  const project = projects.find((p) => p.id === projectId)

  useEffect(() => {
    setIdeas([])
    setSavedIds(new Set())
  }, [projectId])

  async function handleGenerate() {
    if (!project) {
      setError('Select a project first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await generateIdeas({
        projectId: project.id,
        niche: project.niche,
        platform: project.platform,
        audience: project.target_audience,
        tone: project.tone,
        count: 10,
      })
      setIdeas(data.ideas || [])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not generate ideas. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate(index) {
    if (!project) return
    setRegeneratingIndex(index)
    try {
      const data = await generateIdeas({
        projectId: project.id, niche: project.niche, platform: project.platform,
        audience: project.target_audience, tone: project.tone, count: 1,
      })
      const fresh = data.ideas?.[0]
      if (fresh) {
        setIdeas((prev) => prev.map((idea, i) => (i === index ? fresh : idea)))
      }
    } catch (err) {
      toast.error('Could not regenerate that idea.')
    } finally {
      setRegeneratingIndex(null)
    }
  }

  async function handleSave(idea, index) {
    try {
      const { data, error } = await supabase
        .from('content_ideas')
        .insert({
          project_id: project.id,
          title: idea.title,
          hook: idea.hook,
          angle: idea.angle,
          score: idea.score,
          status: 'Idea',
        })
        .select()
        .single()
      if (error) throw error
      setSavedIds((prev) => new Set(prev).add(index))
      toast.success('Idea saved')
    } catch (err) {
      toast.error(err.message || 'Could not save idea.')
    }
  }

  function handleDelete(index) {
    setIdeas((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUse(idea) {
    navigate('/scripts', { state: { projectId: project.id, idea } })
  }

  return (
    <AppShell title="Content Ideas">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          {projectsLoading ? (
            <p className="text-sm text-vtext-muted">Loading projects…</p>
          ) : (
            <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} />
          )}
        </div>
        <GenerateButton onClick={handleGenerate} loading={loading} disabled={!project} icon={Lightbulb}>
          Generate 10 Ideas
        </GenerateButton>
      </div>

      <ErrorNotice message={error} onRetry={handleGenerate} />

      {!loading && ideas.length === 0 && (
        <EmptyState
          icon={Lightbulb}
          title={project ? 'No ideas generated yet' : 'Select a project to begin'}
          description={project ? `Generate 10 fresh ideas tailored to "${project.name}".` : 'Choose a project above, then generate ideas tailored to its niche and audience.'}
        />
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl2 p-5 animate-pulse-slow h-44" />
          ))}
        </div>
      )}

      {!loading && ideas.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea, i) => (
            <IdeaCard
              key={i}
              idea={idea}
              saved={savedIds.has(i)}
              regenerating={regeneratingIndex === i}
              onUse={() => handleUse(idea)}
              onRegenerate={() => handleRegenerate(i)}
              onSave={() => handleSave(idea, i)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
