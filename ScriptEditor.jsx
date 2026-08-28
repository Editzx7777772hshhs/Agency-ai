import { useState } from 'react'
import { Copy, Check, Pencil } from 'lucide-react'

const SECTIONS = [
  { key: 'hook', label: 'HOOK' },
  { key: 'body', label: 'BODY' },
  { key: 'visualSuggestions', label: 'VISUAL SUGGESTIONS', list: true },
  { key: 'cta', label: 'CTA' },
  { key: 'ending', label: 'ENDING' },
]

export function ScriptEditor({ script, onChange }) {
  const [copied, setCopied] = useState(false)

  function fullText() {
    const visuals = (script.visualSuggestions || []).map((v) => `- ${v}`).join('\n')
    return [
      'HOOK', script.hook, '',
      'BODY', script.body, '',
      'VISUAL SUGGESTIONS', visuals, '',
      'CTA', script.cta, '',
      'ENDING', script.ending,
    ].join('\n')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText())
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function updateField(key, value) {
    onChange({ ...script, [key]: value })
  }

  return (
    <div className="glass rounded-xl2 p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-vtext-faint">
          <Pencil size={12} /> Editable — changes save when you click Save
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-vaccent-soft hover:underline"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy full script'}
        </button>
      </div>

      <div className="space-y-5">
        {SECTIONS.map(({ key, label, list }) => (
          <div key={key}>
            <span className="block font-mono text-[11px] tracking-widest text-vaccent-glow mb-1.5">{label}</span>
            {list ? (
              <textarea
                value={(script[key] || []).join('\n')}
                onChange={(e) => updateField(key, e.target.value.split('\n').filter(Boolean))}
                rows={3}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm focus-ring outline-none resize-none font-mono"
                placeholder="One visual cue per line"
              />
            ) : (
              <textarea
                value={script[key] || ''}
                onChange={(e) => updateField(key, e.target.value)}
                rows={key === 'body' ? 6 : 2}
                className="w-full bg-white/5 border border-vborder rounded-lg px-3 py-2.5 text-sm leading-relaxed focus-ring outline-none resize-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
