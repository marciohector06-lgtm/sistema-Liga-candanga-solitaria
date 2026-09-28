import { useState, type FormEvent } from 'react'
import { Field, inputClass } from '../../components/Field'
import { ConfirmarRemocao, Modal, botaoPrimario, botaoSecundario } from '../../components/Modal'
import { useData } from '../../lib/DataContext'
import type { Entrega } from '../../lib/types'
import { BotoesAcao, Busca, TabelaVazia } from './comum'

export function AbaEntregas() {
  const { entregas, doacoes, beneficiarios, removerEntrega } = useData()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Entrega | null>(null)
  const [removendo, setRemovendo] = useState<Entrega | null>(null)

  const descreverDoacao = (id: string) => {
    const doacao = doacoes.find((d) => d.id === id)
    return doacao ? `${doacao.categoria} · ${doacao.quantidade} un.` : '—'
  }
  const nomeBeneficiario = (id: string) => beneficiarios.find((b) => b.id === id)?.nome ?? '—'

  const termo = busca.trim().toLowerCase()
  const lista = [...entregas]
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter(
      (e) =>
        !termo ||
        `${descreverDoacao(e.doacaoId)} ${nomeBeneficiario(e.beneficiarioId)} ${e.responsavel}`.toLowerCase().includes(termo),
    )

  function confirmarRemocao() {
    if (removendo) removerEntrega(removendo.id)
    setRemovendo(null)
  }

  return (
    <div className="space-y-4">
      <Busca valor={busca} onChange={setBusca} placeholder="Buscar por doação, beneficiário ou responsável" />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Doação</th>
              <th className="px-5 py-3 font-medium">Beneficiário</th>
              <th className="px-5 py-3 font-medium">Responsável</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((entrega) => (
              <tr key={entrega.id}>
                <td className="px-5 py-3 text-slate-600">{entrega.data}</td>
                <td className="px-5 py-3 text-slate-900">{descreverDoacao(entrega.doacaoId)}</td>
                <td className="px-5 py-3 text-slate-900">{nomeBeneficiario(entrega.beneficiarioId)}</td>
                <td className="px-5 py-3 text-slate-600">{entrega.responsavel}</td>
                <td className="px-5 py-3">
                  <BotoesAcao onEditar={() => setEditando(entrega)} onRemover={() => setRemovendo(entrega)} />
                </td>
              </tr>
            ))}
            {lista.length === 0 && <TabelaVazia colunas={5} busca={termo} texto="Nenhuma entrega registrada." />}
          </tbody>
        </table>
      </div>

      <Modal titulo="Editar entrega" aberto={editando !== null} onFechar={() => setEditando(null)}>
        {editando && (
          <FormEditarEntrega
            key={editando.id}
            entrega={editando}
            descricaoDoacao={descreverDoacao(editando.doacaoId)}
            onConcluir={() => setEditando(null)}
          />
        )}
      </Modal>

      <ConfirmarRemocao
        aberto={removendo !== null}
        descricao={
          removendo
            ? `a entrega de ${descreverDoacao(removendo.doacaoId)} para ${nomeBeneficiario(removendo.beneficiarioId)}`
            : ''
        }
        aviso="A doação voltará a ficar Disponível para uma nova entrega."
        erro=""
        onConfirmar={confirmarRemocao}
        onFechar={() => setRemovendo(null)}
      />
    </div>
  )
}

interface FormEditarEntregaProps {
  entrega: Entrega
  descricaoDoacao: string
  onConcluir: () => void
}

function FormEditarEntrega({ entrega, descricaoDoacao, onConcluir }: FormEditarEntregaProps) {
  const { beneficiarios, doacoes, atualizarEntrega } = useData()
  const [beneficiarioId, setBeneficiarioId] = useState(entrega.beneficiarioId)
  const [data, setData] = useState(entrega.data)
  const [responsavel, setResponsavel] = useState(entrega.responsavel)
  const [erro, setErro] = useState('')

  const dataMinima = doacoes.find((d) => d.id === entrega.doacaoId)?.data

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    const resultado = atualizarEntrega(entrega.id, { beneficiarioId, data, responsavel: responsavel.trim() })
    if (resultado) setErro(resultado)
    else onConcluir()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Doação">
          <input type="text" className={`${inputClass} bg-slate-50 text-slate-500`} value={descricaoDoacao} disabled />
        </Field>
        <p className="mt-1 text-xs text-slate-400">
          Para trocar a doação, remova esta entrega e registre uma nova.
        </p>
      </div>
      <div className="sm:col-span-2">
        <Field label="Beneficiário">
          <select className={inputClass} value={beneficiarioId} onChange={(e) => setBeneficiarioId(e.target.value)}>
            {beneficiarios.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome} · {b.regiao}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Responsável">
        <input type="text" className={inputClass} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required />
      </Field>
      <Field label="Data da entrega">
        <input
          type="date"
          className={inputClass}
          value={data}
          min={dataMinima}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </Field>
      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{erro}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={onConcluir} className={botaoSecundario}>
          Cancelar
        </button>
        <button type="submit" className={botaoPrimario}>
          Salvar alterações
        </button>
      </div>
    </form>
  )
}
