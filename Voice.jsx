import { useState } from 'react'
import { Mic, Play, AlertCircle } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { GenerateButton } from '../components/GenerateButton'
import { useToast } from '../components/Toast'

const VOICES = ['Narrator — Warm', 'Narrator — Energetic', 'Narrator — Calm', 'Narrator — News-style']
const SPEEDS = ['0.75x', '1x', '1.25x', '1.5x']

// V1: no TTS provider is wired up yet. This page is built so a real provider
// (ElevenLabs, PlayHT, etc.) can be dropped into supabase/functions/generate-voice
// without changing this UI.
const VOICE_API_CONFIGURED = false

export default function Voice() {
  const toast = useToast()
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState(VOICES[0])
  const [speed, setSpeed] = useState(SPEEDS[1])
  const [generating, setGenerating] = useState(false)

  function handlePreview() {
    toast.info('Voice preview needs a configured TTS provider — see the note below.')
  }

  function handleGenerate() {
    if (!VOICE_API_CONFIGURED) {
      toast.error('Voice API not configured yet.')
      return
    }
    setGenerating(true)
  }

  return (
    <AppShell title="Voice">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="glass rounded-xl2 p-5 shadow-card">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
            <Mic size={15} className="text-vaccent-soft" /> Script
          </h2>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={14}
            placeholder="Paste or write the script you want narrated…"
            className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm leading-relaxed focus-ring outline-none resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl2 p-5 shadow-card space-y-4">
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              >
                {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-vtext-muted mb-1.5">Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              >
                {SPEEDS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={handlePreview}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-vborder transition-colors rounded-lg py-2.5 text-sm font-medium"
            >
              <Play size={15} /> Preview
            </button>

            <GenerateButton onClick={handleGenerate} loading={generating} disabled={!script.trim()} className="w-full">
              Generate Voice
            </GenerateButton>
          </div>

          {!VOICE_API_CONFIGURED && (
            <div className="flex items-start gap-2.5 bg-vwarn/10 border border-vwarn/30 rounded-lg px-4 py-3 text-sm text-vwarn">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>Voice API not configured. Connect a TTS provider in <code className="font-mono text-xs">supabase/functions/generate-voice</code> to enable narration.</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
