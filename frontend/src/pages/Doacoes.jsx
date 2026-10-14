import { useState } from 'react'
import { Field, inputClass } from '../components/Field'
import { StatusBadge } from '../components/StatusBadge'
import { useData } from '../lib/DataContext'
import { hojeLocal } from '../lib/datas'
import { CATEGORIAS_DOACAO } from '../lib/constantes'

export function Doacoes() {
  const { doacoes, adicionarDoacao } = useData()
  const [categoria, setCategoria] = useState('Cesta básica')
  const [quantidade, setQuantidade] = useState('')
  const [origem, setOrigem] = useState('')
  const [data, setData] = useState(hojeLocal)

  async function handleSubmit(evento) {
    evento.preventDefault()
    const quantidadeNumero = Number(quantidade)
    if (!quantidadeNumero || quantidadeNumero <= 0 || !origem.trim()) return

    const erro = await adicionarDoacao({ categoria, quantidade: quantidadeNumero, origem: origem.trim(), data })
    if (erro) return
    setQuantidade('')
    setOrigem('')
  }

  const doacoesOrdenadas = [...doacoes].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Doações</h2>
        <p className="mt-1 text-sm text-slate-500">Registre o que foi arrecadado e acompanhe o status de cada lote.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Categoria">
          <select
            className={inputClass}
            value={categoria}
            onChange={(evento) => setCategoria(evento.target.value)}
          >
            {CATEGORIAS_DOACAO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantidade">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={quantidade}
            onChange={(evento) => setQuantidade(evento.target.value)}
            required
          />
        </Field>
        <Field label="Origem (equipe, torcida, parceiro)">
          <input
            type="text"
            className={inputClass}
            value={origem}
            onChange={(evento) => setOrigem(evento.target.value)}
            placeholder="Ex.: Equipe Guará FS"
            required
          />
        </Field>
        <Field label="Data de recebimento">
          <input
            type="date"
            className={inputClass}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            required
          />
        </Field>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Registrar doação
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Quantidade</th>
              <th className="px-5 py-3 font-medium">Origem</th>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doacoesOrdenadas.map((doacao) => (
              <tr key={doacao.id}>
                <td className="px-5 py-3 text-slate-900">{doacao.categoria}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.quantidade}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.origem}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.data}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={doacao.status} />
                </td>
              </tr>
            ))}
            {doacoesOrdenadas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Nenhuma doação registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
