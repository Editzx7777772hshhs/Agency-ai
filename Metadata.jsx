import { useState } from 'react'
import { Tags, Copy, Check, ImageIcon } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { GenerateButton, ErrorNotice } from '../components/GenerateButton'
import { useToast } from '../components/Toast'
import { generateMetadata } from '../services/metadataAgent'
import { ApiError } from '../lib/api'

const PLATFORMS = ['YouTube', 'YouTube Shorts', 'Instagram', 'TikTok', 'Facebook']

export default function Metadata() {
  const toast = useToast()
  const [script, setScript] = useState('')
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState(PLATFORMS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleGenerate() {
    if (!script.trim() && !topic.trim()) {
      setError('Paste a script or describe the topic first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await generateMetadata({ scriptText: script.trim(), platform, topic: topic.trim() })
      setResult(data)
      toast.success('Metadata generated')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not generate metadata. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Metadata">
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="glass rounded-xl2 p-5 shadow-card h-fit space-y-4">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2">
            <Tags size={15} className="text-vaccent-soft" /> Source
          </h2>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
              placeholder="What's the video about?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Script <span className="text-vtext-faint">(paste for best results)</span></label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none resize-none"
              placeholder="Paste your script here…"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vtext-muted mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none"
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <GenerateButton onClick={handleGenerate} loading={loading} className="w-full">
            Generate Metadata
          </GenerateButton>

          <ErrorNotice message={error} onRetry={handleGenerate} />
        </div>

        <div className="space-y-4">
          {!result && !loading && (
            <EmptyState icon={Tags} title="No metadata yet" description="Add a topic or script and generate titles, description, hashtags and a thumbnail concept." />
          )}

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-xl2 p-5 animate-pulse-slow h-24" />
              ))}
            </div>
          )}

          {result && !loading && (
            <>
              <CopyCard title="Title options" items={result.titles} />
              <CopyCard title="Description" text={result.description} />
              <CopyCard title="Hashtags" items={result.hashtags?.map((h) => (h.startsWith('#') ? h : `#${h}`))} inline />
              <CopyCard title="Keywords" items={result.keywords} inline />
              <CopyCard title="Thumbnail text" text={result.thumbnailText} />
              <div className="glass rounded-xl2 p-5 shadow-card">
                <h3 className="flex items-center gap-2 font-display font-semibold text-sm mb-2">
                  <ImageIcon size={15} className="text-vaccent-soft" /> Thumbnail concept
                </h3>
                <p className="text-sm text-vtext-muted leading-relaxed">{result.thumbnailConcept}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function CopyCard({ title, text, items, inline }) {
  const [copied, setCopied] = useState(false)
  const content = text || (items || []).join(inline ? ' ' : '\n')

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="glass rounded-xl2 p-5 shadow-card">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-display font-semibold text-sm">{title}</h3>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium text-vaccent-soft hover:underline">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {text && <p className="text-sm text-vtext-muted leading-relaxed">{text}</p>}
      {items && (
        <div className={inline ? 'flex flex-wrap gap-1.5' : 'space-y-1.5'}>
          {items.map((item, i) =>
            inline ? (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-vborder text-vtext-muted">{item}</span>
            ) : (
              <p key={i} className="text-sm text-vtext-muted">{item}</p>
            )
          )}
        </div>
      )}
    </div>
  )
}
