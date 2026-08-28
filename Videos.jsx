import { useState } from 'react'
import { Clapperboard, Download, Plus, Trash2 } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useToast } from '../components/Toast'
import { callEdgeFunction, ApiError } from '../lib/api'

export default function Videos() {
  const toast = useToast()
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scenes, setScenes] = useState([])

  async function handleGenerate() {
    if (!script.trim()) {
      setError('Paste a script to build a video blueprint from.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await callEdgeFunction('generate-video-blueprint', { script: script.trim() })
      setScenes(data.scenes || [])
      toast.success('Blueprint generated')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not generate a blueprint. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  function updateScene(index, field, value) {
    setScenes((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function addScene() {
    setScenes((prev) => [
      ...prev,
      { timestamp: '', narration: '', visual: '', broll: '', onScreenText: '', transition: '' },
    ])
  }

  function removeScene(index) {
    setScenes((prev) => prev.filter((_, i) => i !== index))
  }

  function exportBlueprint() {
    const text = scenes
      .map((s, i) => (
        `Scene ${i + 1} — ${s.timestamp}\n` +
        `Narration: ${s.narration}\n` +
        `Visual: ${s.visual}\n` +
        `B-roll: ${s.broll}\n` +
        `On-screen text: ${s.onScreenText}\n` +
        `Transition: ${s.transition}\n`
      ))
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vanta-video-blueprint.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell title="Videos">
      <div className="glass rounded-xl2 p-5 shadow-card mb-6">
        <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
          <Clapperboard size={15} className="text-vaccent-soft" /> Script to storyboard
        </h2>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={5}
          placeholder="Paste your script here — VANTA will break it into a scene-by-scene production blueprint."
          className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none resize-none mb-3"
        />
        <div className="flex items-center gap-3">
          <GenerateButton onClick={handleGenerate} loading={loading}>Generate Blueprint</GenerateButton>
          {scenes.length > 0 && (
            <button
              onClick={exportBlueprint}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-vborder transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              <Download size={15} /> Export
            </button>
          )}
        </div>
        <ErrorNotice message={error} onRetry={handleGenerate} />
      </div>

      {!loading && scenes.length === 0 && (
        <EmptyState
          icon={Clapperboard}
          title="No blueprint yet"
          description="VANTA doesn't auto-render video in V1 — it generates a scene-by-scene production plan you can hand to an editor."
        />
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-xl2 p-5 animate-pulse-slow h-28" />
          ))}
        </div>
      )}

      {!loading && scenes.length > 0 && (
        <div className="space-y-3">
          {scenes.map((s, i) => (
            <div key={i} className="glass rounded-xl2 p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-sm">Scene {i + 1}</span>
                <div className="flex items-center gap-3">
                  <input
                    value={s.timestamp}
                    onChange={(e) => updateScene(i, 'timestamp', e.target.value)}
                    placeholder="0–3 sec"
                    className="w-28 bg-white/5 border border-vborder rounded-lg px-2.5 py-1 text-xs font-mono focus-ring outline-none text-right"
                  />
                  <button onClick={() => removeScene(i)} className="text-vtext-faint hover:text-vdanger transition-colors" aria-label="Remove scene">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Narration" value={s.narration} onChange={(v) => updateScene(i, 'narration', v)} />
                <Field label="Visual suggestion" value={s.visual} onChange={(v) => updateScene(i, 'visual', v)} />
                <Field label="B-roll suggestion" value={s.broll} onChange={(v) => updateScene(i, 'broll', v)} />
                <Field label="On-screen text" value={s.onScreenText} onChange={(v) => updateScene(i, 'onScreenText', v)} />
                <Field label="Transition" value={s.transition} onChange={(v) => updateScene(i, 'transition', v)} full />
              </div>
            </div>
          ))}
          <button
            onClick={addScene}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-vborder hover:border-white/30 transition-colors rounded-xl2 py-3 text-sm text-vtext-muted"
          >
            <Plus size={15} /> Add scene
          </button>
        </div>
      )}
    </AppShell>
  )
}

function Field({ label, value, onChange, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-[11px] text-vtext-faint mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-vborder rounded-lg px-2.5 py-2 text-sm focus-ring outline-none"
      />
    </div>
  )
}
