import { FolderKanban } from 'lucide-react'

export function ProjectSelector({ projects, value, onChange, label = 'Project' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-vtext-muted mb-1.5">{label}</label>
      <div className="relative">
        <FolderKanban size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vtext-faint pointer-events-none" />
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-vborder rounded-lg pl-9 pr-3 py-2.5 text-sm focus-ring outline-none appearance-none"
        >
          <option value="" disabled>Select a project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} · {p.platform}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
