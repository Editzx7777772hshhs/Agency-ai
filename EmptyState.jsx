export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="glass rounded-xl2 p-10 flex flex-col items-center text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-vaccent/10 flex items-center justify-center mb-4">
          <Icon size={22} className="text-vaccent-soft" />
        </div>
      )}
      <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
      {description && <p className="text-sm text-vtext-muted max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}
