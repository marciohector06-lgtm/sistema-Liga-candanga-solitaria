import { useState } from 'react'
import { Field, inputClass } from '../../components/Field'
import { ConfirmarRemocao, Modal, botaoPrimario, botaoSecundario } from '../../components/Modal'
import { useData } from '../../lib/DataContext'
import { BotoesAcao, Busca, TabelaVazia } from './comum'

export function AbaBeneficiarios() {
  const { beneficiarios, entregas, removerBeneficiario } = useData()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [erroRemocao, setErroRemocao] = useState('')

  const termo = busca.trim().toLowerCase()
  const lista = [...beneficiarios]
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .filter((b) => !termo || `${b.nome} ${b.tipo} ${b.regiao} ${b.contato}`.toLowerCase().includes(termo))

  function fecharRemocao() {
    setRemovendo(null)
    setErroRemocao('')
  }

  async function confirmarRemocao() {
    if (!removendo) return
    const erro = await removerBeneficiario(removendo.id)
    if (erro) setErroRemocao(erro)
    else fecharRemocao()
  }

  return (
    <div className="space-y-4">
      <Busca valor={busca} onChange={setBusca} placeholder="Buscar por nome, tipo, região ou contato" />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Região</th>
              <th className="px-5 py-3 font-medium">Entregas</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((beneficiario) => (
              <tr key={beneficiario.id}>
                <td className="px-5 py-3 text-slate-900">{beneficiario.nome}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.tipo}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.regiao}</td>
                <td className="px-5 py-3 text-slate-600">
                  {entregas.filter((e) => e.beneficiarioId === beneficiario.id).length}
                </td>
                <td className="px-5 py-3">
                  <BotoesAcao onEditar={() => setEditando(beneficiario)} onRemover={() => setRemovendo(beneficiario)} />
                </td>
              </tr>
            ))}
            {lista.length === 0 && <TabelaVazia colunas={5} busca={termo} texto="Nenhum beneficiário cadastrado." />}
          </tbody>
        </table>
      </div>

      <Modal titulo="Editar beneficiário" aberto={editando !== null} onFechar={() => setEditando(null)}>
        {editando && (
          <FormEditarBeneficiario key={editando.id} beneficiario={editando} onConcluir={() => setEditando(null)} />
        )}
      </Modal>

      <ConfirmarRemocao
        aberto={removendo !== null}
        descricao={removendo?.nome ?? ''}
        erro={erroRemocao}
        onConfirmar={confirmarRemocao}
        onFechar={fecharRemocao}
      />
    </div>
  )
}

function FormEditarBeneficiario({ beneficiario, onConcluir }) {
  const { opcoes, atualizarBeneficiario } = useData()
  const [nome, setNome] = useState(beneficiario.nome)
  const [tipo, setTipo] = useState(beneficiario.tipo)
  const [regiao, setRegiao] = useState(beneficiario.regiao)
  const [contato, setContato] = useState(beneficiario.contato)
  const [necessidade, setNecessidade] = useState(beneficiario.necessidade)
  const [erro, setErro] = useState('')

  async function handleSubmit(evento) {
    evento.preventDefault()
    const resultado = await atualizarBeneficiario(beneficiario.id, {
      nome: nome.trim(),
      tipo,
      regiao,
      contato: contato.trim(),
      necessidade: necessidade.trim(),
    })
    if (resultado) setErro(resultado)
    else onConcluir()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nome">
          <input type="text" className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Field>
      </div>
      <Field label="Tipo">
        <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {opcoes.tipos.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Região administrativa">
        <select className={inputClass} value={regiao} onChange={(e) => setRegiao(e.target.value)}>
          {opcoes.regioes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Contato">
          <input type="text" className={inputClass} value={contato} onChange={(e) => setContato(e.target.value)} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Necessidade principal">
          <textarea className={inputClass} rows={2} value={necessidade} onChange={(e) => setNecessidade(e.target.value)} />
        </Field>
      </div>
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
