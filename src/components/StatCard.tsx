interface StatCardProps {
  label: string
  value: number | string
  accent?: 'blue' | 'green' | 'amber' | 'slate'
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'border-l-sky-500',
  green: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  slate: 'border-l-slate-500',
}

export function StatCard({ label, value, accent = 'slate' }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${ACCENTS[accent]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
