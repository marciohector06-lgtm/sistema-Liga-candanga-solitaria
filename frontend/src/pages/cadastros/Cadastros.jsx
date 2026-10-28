import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Field, inputClass } from '../../components/Field'
import { ConfirmarRemocao, Modal, botaoPrimario, botaoSecundario } from '../../components/Modal'
import { useData } from '../../lib/DataContext'
import { Busca, TabelaVazia } from '../configuracoes/comum'

const LISTAS = [
  {
    id: 'categorias',
    label: 'Categorias de doação',
    descricao: 'Tipos de item que a Liga recebe, como cesta básica, bola ou medalha.',
    exemplo: 'Ex.: Medalha',
    unidadeUso: 'doação(ões)',
  },
  {
    id: 'tipos',
    label: 'Tipos de beneficiário',
    descricao: 'Quem pode receber doações: time, família, escolinha, instituição...',
    exemplo: 'Ex.: Projeto social',
    unidadeUso: 'beneficiário(s)',
  },
  {
    id: 'regioes',
    label: 'Regiões',
    descricao: 'Regiões administrativas do DF e outros locais dos beneficiários.',
    exemplo: 'Ex.: Formosa (GO)',
    unidadeUso: 'beneficiário(s)',
  },
]

export function Cadastros() {
  const [params, setParams] = useSearchParams()
  const listaAtual = LISTAS.find((lista) => lista.id === params.get('lista')) ?? LISTAS[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Cadastros</h2>
        <p className="mt-1 text-sm text-slate-500">
          Listas usadas nas telas de Doações e Beneficiários. Adicione o que faltar ou corrija um nome.
        </p>
      </div>

      <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200">
        {LISTAS.map((lista) => {
          const ativa = lista.id === listaAtual.id
          return (
            <button
              key={lista.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => setParams({ lista: lista.id })}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                ativa
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {lista.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        <ListaDeCadastro key={listaAtual.id} lista={listaAtual} />
      </div>
    </div>
  )
}

function ListaDeCadastro({ lista }) {
  const { cadastros, adicionarItemCadastro, removerItemCadastro } = useData()
  const [novoNome, setNovoNome] = useState('')
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [renomeando, setRenomeando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [erroRemocao, setErroRemocao] = useState('')

  const termo = busca.trim().toLowerCase()
  const itens = cadastros[lista.id].filter((item) => !termo || item.nome.toLowerCase().includes(termo))

  async function adicionar(evento) {
    evento.preventDefault()
    if (!novoNome.trim()) {
      setErro('Informe um nome.')
      return
    }
    const resultado = await adicionarItemCadastro(lista.id, novoNome.trim())
    if (resultado) {
      setErro(resultado)
      return
    }
    setErro('')
    setNovoNome('')
  }

  function fecharRemocao() {
    setRemovendo(null)
    setErroRemocao('')
  }

  async function confirmarRemocao() {
    if (!removendo) return
    const resultado = await removerItemCadastro(lista.id, removendo.nome)
    if (resultado) setErroRemocao(resultado)
    else fecharRemocao()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={adicionar} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm text-slate-500">{lista.descricao}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-96">
            <Field label="Novo item">
              <input
                type="text"
                maxLength={60}
                className={inputClass}
                value={novoNome}
                onChange={(evento) => setNovoNome(evento.target.value)}
                placeholder={lista.exemplo}
              />
            </Field>
          </div>
          <button type="submit" className={botaoPrimario}>
            Adicionar
          </button>
        </div>
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Busca valor={busca} onChange={setBusca} placeholder="Buscar na lista" />
        <p className="text-sm text-slate-500">{cadastros[lista.id].length} item(ns)</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Em uso</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itens.map((item) => (
              <tr key={item.nome}>
                <td className="px-5 py-3 text-slate-900">{item.nome}</td>
                <td className="px-5 py-3 text-slate-600">
                  {item.uso > 0 ? `${item.uso} ${lista.unidadeUso}` : 'Sem uso'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setRenomeando(item)}
                      className="rounded-md px-2.5 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Renomear
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemovendo(item)}
                      className="rounded-md px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {itens.length === 0 && <TabelaVazia colunas={3} busca={termo} texto="Nenhum item cadastrado." />}
          </tbody>
        </table>
      </div>

      <Modal titulo={`Renomear: ${renomeando?.nome ?? ''}`} aberto={Boolean(renomeando)} onFechar={() => setRenomeando(null)}>
        {renomeando && (
          <FormRenomear lista={lista} item={renomeando} onConcluir={() => setRenomeando(null)} />
        )}
      </Modal>

      <ConfirmarRemocao
        aberto={Boolean(removendo)}
        descricao={removendo?.nome}
        erro={
          erroRemocao ||
          (removendo?.uso > 0
            ? `Este item está em uso por ${removendo.uso} ${lista.unidadeUso}. Troque-o nesses registros antes de remover.`
            : '')
        }
        onConfirmar={confirmarRemocao}
        onFechar={fecharRemocao}
      />
    </div>
  )
}

function FormRenomear({ lista, item, onConcluir }) {
  const { renomearItemCadastro } = useData()
  const [nome, setNome] = useState(item.nome)
  const [erro, setErro] = useState('')

  async function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim()) {
      setErro('Informe um nome.')
      return
    }
    const resultado = await renomearItemCadastro(lista.id, item.nome, nome.trim())
    if (resultado) setErro(resultado)
    else onConcluir()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Novo nome">
        <input type="text" maxLength={60} className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} required />
      </Field>
      {item.uso > 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          O nome também muda nos {item.uso} {lista.unidadeUso} que usam este item.
        </p>
      )}
      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onConcluir} className={botaoSecundario}>
          Cancelar
        </button>
        <button type="submit" className={botaoPrimario}>
          Salvar
        </button>
      </div>
    </form>
  )
}
