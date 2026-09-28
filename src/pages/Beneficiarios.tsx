import { useState, type FormEvent } from 'react'
import { Field, inputClass } from '../components/Field'
import { useData } from '../lib/DataContext'
import {
  REGIOES_ADMINISTRATIVAS_DF,
  TIPOS_BENEFICIARIO,
  type RegiaoAdministrativa,
  type TipoBeneficiario,
} from '../lib/types'

export function Beneficiarios() {
  const { beneficiarios, adicionarBeneficiario } = useData()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoBeneficiario>('Família')
  const [regiao, setRegiao] = useState<RegiaoAdministrativa>(REGIOES_ADMINISTRATIVAS_DF[0])
  const [contato, setContato] = useState('')
  const [necessidade, setNecessidade] = useState('')

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    if (!nome.trim()) return

    adicionarBeneficiario({ nome: nome.trim(), tipo, regiao, contato: contato.trim(), necessidade: necessidade.trim() })
    setNome('')
    setContato('')
    setNecessidade('')
  }

  const beneficiariosOrdenados = [...beneficiarios].sort((a, b) => b.dataCadastro.localeCompare(a.dataCadastro))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Beneficiários</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre famílias, escolinhas e instituições que podem receber doações da Liga.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <Field label="Nome">
          <input
            type="text"
            className={inputClass}
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Ex.: Escolinha de Futsal do Guará"
            required
          />
        </Field>
        <Field label="Tipo">
          <select className={inputClass} value={tipo} onChange={(evento) => setTipo(evento.target.value as TipoBeneficiario)}>
            {TIPOS_BENEFICIARIO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Região administrativa">
          <select
            className={inputClass}
            value={regiao}
            onChange={(evento) => setRegiao(evento.target.value as RegiaoAdministrativa)}
          >
            {REGIOES_ADMINISTRATIVAS_DF.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Contato">
          <input
            type="text"
            className={inputClass}
            value={contato}
            onChange={(evento) => setContato(evento.target.value)}
            placeholder="Telefone ou e-mail"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Necessidade principal">
            <textarea
              className={inputClass}
              rows={2}
              value={necessidade}
              onChange={(evento) => setNecessidade(evento.target.value)}
              placeholder="Ex.: Uniformes e bolas para a categoria sub-11"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Cadastrar beneficiário
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Região</th>
              <th className="px-5 py-3 font-medium">Contato</th>
              <th className="px-5 py-3 font-medium">Necessidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {beneficiariosOrdenados.map((beneficiario) => (
              <tr key={beneficiario.id}>
                <td className="px-5 py-3 text-slate-900">{beneficiario.nome}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.tipo}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.regiao}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.contato || '—'}</td>
                <td className="px-5 py-3 text-slate-600">{beneficiario.necessidade || '—'}</td>
              </tr>
            ))}
            {beneficiariosOrdenados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Nenhum beneficiário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
