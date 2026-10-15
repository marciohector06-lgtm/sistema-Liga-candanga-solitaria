import { useState } from 'react'
import { Field, inputClass } from '../../components/Field'
import { ConfirmarRemocao, Modal, botaoPrimario, botaoSecundario } from '../../components/Modal'
import { StatusBadge } from '../../components/StatusBadge'
import { useData } from '../../lib/DataContext'
import { CATEGORIAS_DOACAO, STATUS_DOACAO } from '../../lib/constantes'
import { BotoesAcao, Busca, TabelaVazia } from './comum'

export function AbaDoacoes() {
  const { doacoes, removerDoacao } = useData()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [erroRemocao, setErroRemocao] = useState('')

  const termo = busca.trim().toLowerCase()
  const lista = [...doacoes]
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter((d) => !termo || `${d.categoria} ${d.origem} ${d.status}`.toLowerCase().includes(termo))

  function fecharRemocao() {
    setRemovendo(null)
    setErroRemocao('')
  }

  async function confirmarRemocao() {
    if (!removendo) return
    const erro = await removerDoacao(removendo.id)
    if (erro) setErroRemocao(erro)
    else fecharRemocao()
  }

  return (
    <div className="space-y-4">
      <Busca valor={busca} onChange={setBusca} placeholder="Buscar por categoria, origem ou status" />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Qtd.</th>
              <th className="px-5 py-3 font-medium">Origem</th>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((doacao) => (
              <tr key={doacao.id}>
                <td className="px-5 py-3 text-slate-900">{doacao.categoria}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.quantidade}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.origem}</td>
                <td className="px-5 py-3 text-slate-600">{doacao.data}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={doacao.status} />
                </td>
                <td className="px-5 py-3">
                  <BotoesAcao onEditar={() => setEditando(doacao)} onRemover={() => setRemovendo(doacao)} />
                </td>
              </tr>
            ))}
            {lista.length === 0 && <TabelaVazia colunas={6} busca={termo} texto="Nenhuma doação registrada." />}
          </tbody>
        </table>
      </div>

      <Modal titulo="Editar doação" aberto={editando !== null} onFechar={() => setEditando(null)}>
        {editando && <FormEditarDoacao key={editando.id} doacao={editando} onConcluir={() => setEditando(null)} />}
      </Modal>

      <ConfirmarRemocao
        aberto={removendo !== null}
        descricao={removendo ? `${removendo.categoria} · ${removendo.quantidade} un. (${removendo.origem})` : ''}
        erro={erroRemocao}
        onConfirmar={confirmarRemocao}
        onFechar={fecharRemocao}
      />
    </div>
  )
}

function FormEditarDoacao({ doacao, onConcluir }) {
  const { atualizarDoacao } = useData()
  const [categoria, setCategoria] = useState(doacao.categoria)
  const [quantidade, setQuantidade] = useState(String(doacao.quantidade))
  const [origem, setOrigem] = useState(doacao.origem)
  const [data, setData] = useState(doacao.data)
  const [status, setStatus] = useState(doacao.status)
  const [erro, setErro] = useState('')

  async function handleSubmit(evento) {
    evento.preventDefault()
    const resultado = await atualizarDoacao(doacao.id, {
      categoria,
      quantidade: Number(quantidade),
      origem: origem.trim(),
      data,
      status,
    })
    if (resultado) setErro(resultado)
    else onConcluir()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Categoria">
        <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS_DOACAO.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Quantidade">
        <input
          type="number"
          min={1}
          step={1}
          className={inputClass}
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Origem">
          <input type="text" className={inputClass} value={origem} onChange={(e) => setOrigem(e.target.value)} required />
        </Field>
      </div>
      <Field label="Data de recebimento">
        <input type="date" className={inputClass} value={data} onChange={(e) => setData(e.target.value)} required />
      </Field>
      <Field label="Status">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_DOACAO.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
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
