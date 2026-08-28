const ACCENTS = {
  vaccent: { bg: 'bg-vaccent/10', text: 'text-vaccent-soft' },
  vsuccess: { bg: 'bg-vsuccess/10', text: 'text-vsuccess' },
  vwarn: { bg: 'bg-vwarn/10', text: 'text-vwarn' },
  vdanger: { bg: 'bg-vdanger/10', text: 'text-vdanger' },
}

export function DashboardCard({ icon: Icon, label, value, accent = 'vaccent' }) {
  const colors = ACCENTS[accent] || ACCENTS.vaccent
  return (
    <div className="glass rounded-xl2 p-5 shadow-card hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-vtext-muted uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon size={16} className={colors.text} />
          </div>
        )}
      </div>
      <p className="font-display font-semibold text-2xl">{value}</p>
    </div>
  )
}
