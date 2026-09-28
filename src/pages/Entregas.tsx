import { useState, type FormEvent } from 'react'
import { Field, inputClass } from '../components/Field'
import { useData } from '../lib/DataContext'
import { hojeLocal } from '../lib/datas'

export function Entregas() {
  const { doacoes, beneficiarios, entregas, registrarEntrega } = useData()

  const doacoesDisponiveis = doacoes.filter((d) => d.status === 'Disponível')

  const [doacaoId, setDoacaoId] = useState('')
  const [beneficiarioId, setBeneficiarioId] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [data, setData] = useState(hojeLocal)
  const [erro, setErro] = useState('')

  const doacaoSelecionada = doacoesDisponiveis.find((d) => d.id === doacaoId)

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    if (!doacaoId || !beneficiarioId || !responsavel.trim()) return
    if (doacaoSelecionada && data < doacaoSelecionada.data) {
      setErro(`A data da entrega não pode ser anterior ao recebimento da doação (${doacaoSelecionada.data}).`)
      return
    }

    registrarEntrega({ doacaoId, beneficiarioId, data, responsavel: responsavel.trim() })
    setErro('')
    setDoacaoId('')
    setBeneficiarioId('')
    setResponsavel('')
  }

  const entregasOrdenadas = [...entregas].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Entregas</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vincule uma doação disponível a um beneficiário para registrar a entrega.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Doação disponível">
          <select className={inputClass} value={doacaoId} onChange={(evento) => setDoacaoId(evento.target.value)} required>
            <option value="" disabled>
              Selecione
            </option>
            {doacoesDisponiveis.map((doacao) => (
              <option key={doacao.id} value={doacao.id}>
                {doacao.categoria} · {doacao.quantidade} un. · {doacao.origem}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Beneficiário">
          <select
            className={inputClass}
            value={beneficiarioId}
            onChange={(evento) => setBeneficiarioId(evento.target.value)}
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {beneficiarios.map((beneficiario) => (
              <option key={beneficiario.id} value={beneficiario.id}>
                {beneficiario.nome} · {beneficiario.regiao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsável pela entrega">
          <input
            type="text"
            className={inputClass}
            value={responsavel}
            onChange={(evento) => setResponsavel(evento.target.value)}
            placeholder="Nome de quem entregou"
            required
          />
        </Field>
        <Field label="Data da entrega">
          <input
            type="date"
            className={inputClass}
            value={data}
            min={doacaoSelecionada?.data}
            onChange={(evento) => {
              setData(evento.target.value)
              setErro('')
            }}
            required
          />
        </Field>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={doacoesDisponiveis.length === 0 || beneficiarios.length === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Registrar entrega
          </button>
          {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
          {doacoesDisponiveis.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Não há doações disponíveis para vincular no momento.</p>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Doação</th>
              <th className="px-5 py-3 font-medium">Beneficiário</th>
              <th className="px-5 py-3 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entregasOrdenadas.map((entrega) => {
              const doacao = doacoes.find((d) => d.id === entrega.doacaoId)
              const beneficiario = beneficiarios.find((b) => b.id === entrega.beneficiarioId)
              return (
                <tr key={entrega.id}>
                  <td className="px-5 py-3 text-slate-600">{entrega.data}</td>
                  <td className="px-5 py-3 text-slate-900">
                    {doacao ? `${doacao.categoria} · ${doacao.quantidade} un.` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-900">{beneficiario?.nome ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{entrega.responsavel}</td>
                </tr>
              )
            })}
            {entregasOrdenadas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  Nenhuma entrega registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
