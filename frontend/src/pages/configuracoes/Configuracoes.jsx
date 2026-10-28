import { useSearchParams } from 'react-router-dom'
import { AbaBeneficiarios } from './AbaBeneficiarios'
import { AbaDoacoes } from './AbaDoacoes'
import { AbaEntregas } from './AbaEntregas'
import { AbaSistema } from './AbaSistema'

const ABAS = [
  { id: 'doacoes', label: 'Doações', componente: AbaDoacoes },
  { id: 'beneficiarios', label: 'Beneficiários', componente: AbaBeneficiarios },
  { id: 'entregas', label: 'Entregas', componente: AbaEntregas },
  { id: 'sistema', label: 'Sistema', componente: AbaSistema },
]

export function Configuracoes() {
  const [params, setParams] = useSearchParams()
  const abaAtual = ABAS.find((aba) => aba.id === params.get('aba')) ?? ABAS[0]
  const Conteudo = abaAtual.componente

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Configurações</h2>
        <p className="mt-1 text-sm text-slate-500">
          Área do administrador: edite ou remova registros e gerencie os dados do sistema.
        </p>
      </div>

      <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200">
        {ABAS.map((aba) => {
          const ativa = aba.id === abaAtual.id
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => setParams({ aba: aba.id })}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                ativa
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {aba.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        <Conteudo />
      </div>
    </div>
  )
}
