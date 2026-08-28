import { Flame, RefreshCw, Save, Trash2, ArrowRight } from 'lucide-react'

const FORMAT_LABEL = {
  short: 'Short-form',
  long: 'Long-form',
  carousel: 'Carousel',
  live: 'Live / Stream',
}

export function IdeaCard({ idea, onUse, onRegenerate, onSave, onDelete, saved, regenerating }) {
  const score = Math.max(0, Math.min(100, Number(idea.score) || 0))
  const scoreColor = score >= 75 ? 'text-vsuccess' : score >= 50 ? 'text-vwarn' : 'text-vdanger'

  return (
    <div className="glass rounded-xl2 p-5 shadow-card flex flex-col gap-3 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-sm leading-snug">{idea.title}</h3>
        <div className={`flex items-center gap-1 shrink-0 text-xs font-semibold ${scoreColor}`}>
          <Flame size={13} />
          {score}
        </div>
      </div>

      <p className="text-sm text-vtext-muted leading-relaxed">{idea.hook}</p>

      <div className="flex flex-wrap gap-1.5">
        <Tag>{idea.angle}</Tag>
        {idea.targetEmotion && <Tag>{idea.targetEmotion}</Tag>}
        {idea.format && <Tag>{FORMAT_LABEL[idea.format] || idea.format}</Tag>}
      </div>

      <div className="flex items-center gap-2 mt-1 pt-3 border-t border-vborder">
        <button
          onClick={onUse}
          className="flex items-center gap-1 text-xs font-semibold text-vaccent-soft hover:underline"
        >
          Use idea <ArrowRight size={12} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="text-vtext-faint hover:text-vtext transition-colors disabled:opacity-50"
          aria-label="Regenerate this idea"
          title="Regenerate"
        >
          <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={onSave}
          className={`transition-colors ${saved ? 'text-vsuccess' : 'text-vtext-faint hover:text-vtext'}`}
          aria-label="Save idea"
          title={saved ? 'Saved' : 'Save'}
        >
          <Save size={14} />
        </button>
        <button
          onClick={onDelete}
          className="text-vtext-faint hover:text-vdanger transition-colors"
          aria-label="Delete idea"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-vborder text-vtext-muted">
      {children}
    </span>
  )
}
