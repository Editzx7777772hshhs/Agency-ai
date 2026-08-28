import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from './Toast'

const PLATFORMS = ['YouTube', 'YouTube Shorts', 'Instagram', 'TikTok', 'Facebook']
const TONES = ['Professional', 'Educational', 'Entertaining', 'Storytelling', 'Casual', 'Motivational', 'News-style']

export function CreateProjectModal({ open, onClose, onCreate }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: '', niche: '', platform: PLATFORMS[0], target_audience: '', tone: TONES[0],
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!open) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Give your project a name'
    if (!form.niche.trim()) e.niche = 'Describe the niche'
    if (!form.target_audience.trim()) e.target_audience = 'Describe your audience'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onCreate(form)
      toast.success(`Project "${form.name}" created`)
      setForm({ name: '', niche: '', platform: PLATFORMS[0], target_audience: '', tone: TONES[0] })
      onClose()
    } catch (err) {
      toast.error(err.message || 'Could not create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass rounded-xl2 p-6 w-full max-w-md shadow-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">New project</h2>
          <button onClick={onClose} className="text-vtext-muted hover:text-vtext focus-ring rounded p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Project name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              placeholder="Late Night Gaming Clips"
            />
            {errors.name && <p className="text-xs text-vdanger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Niche</label>
            <input
              value={form.niche}
              onChange={(e) => update('niche', e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              placeholder="Speedrunning & retro games"
            />
            {errors.niche && <p className="text-xs text-vdanger mt-1">{errors.niche}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => update('platform', e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Tone</label>
              <select
                value={form.tone}
                onChange={(e) => update('tone', e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              >
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Target audience</label>
            <textarea
              value={form.target_audience}
              onChange={(e) => update('target_audience', e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none resize-none"
              placeholder="18-30 year old gamers who love nostalgia content"
            />
            {errors.target_audience && <p className="text-xs text-vdanger mt-1">{errors.target_audience}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-vaccent hover:bg-vaccent-soft disabled:opacity-60 transition-colors rounded-lg py-2.5 text-sm font-semibold mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </div>
    </div>
  )
}
