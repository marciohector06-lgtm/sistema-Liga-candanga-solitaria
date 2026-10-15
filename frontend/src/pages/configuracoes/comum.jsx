import { inputClass } from '../../components/Field'

export function Busca({ valor, onChange, placeholder }) {
  return (
    <input
      type="search"
      aria-label={placeholder}
      className={`${inputClass} sm:max-w-sm`}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export function BotoesAcao({ onEditar, onRemover }) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={onEditar}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
      >
        Editar
      </button>
      <button type="button" onClick={onRemover} className="rounded-md px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50">
        Remover
      </button>
    </div>
  )
}

export function TabelaVazia({ colunas, busca, texto }) {
  return (
    <tr>
      <td colSpan={colunas} className="px-5 py-6 text-center text-slate-400">
        {busca ? 'Nenhum resultado para a busca.' : texto}
      </td>
    </tr>
  )
}
