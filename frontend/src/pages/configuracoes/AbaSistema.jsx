import { useState } from 'react'
import { Modal, botaoPerigo, botaoSecundario } from '../../components/Modal'
import { useData } from '../../lib/DataContext'

const TEXTOS = {
  exemplo: {
    titulo: 'Restaurar dados de exemplo',
    descricao: 'Todos os registros atuais, inclusive os times cadastrados, serão substituídos pelos dados de exemplo iniciais. As listas da tela Cadastros são mantidas.',
    botao: 'Restaurar exemplo',
  },
  apagar: {
    titulo: 'Apagar todos os dados',
    descricao: 'Todas as doações, beneficiários (inclusive os times) e entregas serão apagados. As listas da tela Cadastros são mantidas.',
    botao: 'Apagar tudo',
  },
}

export function AbaSistema() {
  const { resumo, resetarDadosExemplo, apagarTodosOsDados } = useData()
  const [acao, setAcao] = useState(null)
  const [concluido, setConcluido] = useState('')

  async function confirmar() {
    if (acao === 'exemplo') await resetarDadosExemplo()
    if (acao === 'apagar') await apagarTodosOsDados()
    setConcluido(acao === 'exemplo' ? 'Dados de exemplo restaurados.' : 'Todos os dados foram apagados.')
    setAcao(null)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Dados armazenados</h3>
        <p className="mt-1 text-sm text-slate-500">
          Os dados ficam salvos no servidor e são compartilhados por todos que acessam o sistema.
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Doações</dt>
            <dd className="text-lg font-semibold text-slate-900">{resumo.totalDoacoes}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Beneficiários</dt>
            <dd className="text-lg font-semibold text-slate-900">{resumo.totalBeneficiarios}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Entregas</dt>
            <dd className="text-lg font-semibold text-slate-900">{resumo.totalEntregas}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-red-700">Zona de risco</h3>
        <div className="mt-4 space-y-4">
          {Object.keys(TEXTOS).map((chave) => (
            <div key={chave} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{TEXTOS[chave].titulo}</p>
                <p className="text-sm text-slate-500">{TEXTOS[chave].descricao}</p>
              </div>
              <button type="button" onClick={() => setAcao(chave)} className={`${botaoPerigo} shrink-0`}>
                {TEXTOS[chave].botao}
              </button>
            </div>
          ))}
        </div>
        {concluido && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{concluido}</p>}
      </div>

      <Modal titulo={acao ? TEXTOS[acao].titulo : ''} aberto={acao !== null} onFechar={() => setAcao(null)}>
        <p className="text-sm text-slate-600">{acao && TEXTOS[acao].descricao} Essa ação não pode ser desfeita.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setAcao(null)} className={botaoSecundario}>
            Cancelar
          </button>
          <button type="button" onClick={confirmar} className={botaoPerigo}>
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  )
}
