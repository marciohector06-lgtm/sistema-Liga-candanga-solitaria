import type { StatusDoacao } from '../lib/types'

const ESTILOS: Record<StatusDoacao, string> = {
  'Disponível': 'bg-sky-100 text-sky-700 ring-sky-600/20',
  'Reservada': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'Entregue': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
}

export function StatusBadge({ status }: { status: StatusDoacao }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${ESTILOS[status]}`}
    >
      {status}
    </span>
  )
}
