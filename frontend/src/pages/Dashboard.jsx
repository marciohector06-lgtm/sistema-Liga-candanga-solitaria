import { StatCard } from '../components/StatCard'
import { useData } from '../lib/DataContext'

export function Dashboard() {
  const { resumo, entregas, doacoes, beneficiarios } = useData()

  const ultimasEntregas = [...entregas]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)
    .map((entrega) => ({
      entrega,
      doacao: doacoes.find((d) => d.id === entrega.doacaoId),
      beneficiario: beneficiarios.find((b) => b.id === entrega.beneficiarioId),
    }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Resumo de impacto</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral das doações, beneficiários e entregas registradas no programa.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Doações recebidas" value={resumo.totalDoacoes} accent="blue" />
        <StatCard label="Doações disponíveis" value={resumo.doacoesDisponiveis} accent="amber" />
        <StatCard label="Beneficiários cadastrados" value={resumo.totalBeneficiarios} accent="slate" />
        <StatCard label="Entregas realizadas" value={resumo.totalEntregas} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Doações por categoria</h3>
          <ul className="mt-4 space-y-2">
            {Object.entries(resumo.doacoesPorCategoria).map(([categoria, quantidade]) => (
              <li key={categoria} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{categoria}</span>
                <span className="font-semibold text-slate-900">{quantidade}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Beneficiários por região administrativa</h3>
          <ul className="mt-4 space-y-2">
            {Object.entries(resumo.beneficiariosPorRegiao).map(([regiao, quantidade]) => (
              <li key={regiao} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{regiao}</span>
                <span className="font-semibold text-slate-900">{quantidade}</span>
              </li>
            ))}
            {Object.keys(resumo.beneficiariosPorRegiao).length === 0 && (
              <li className="text-sm text-slate-400">Nenhum beneficiário cadastrado ainda.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Últimas entregas</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-4 font-medium">Data</th>
                <th className="pb-2 pr-4 font-medium">Doação</th>
                <th className="pb-2 pr-4 font-medium">Beneficiário</th>
                <th className="pb-2 font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultimasEntregas.map(({ entrega, doacao, beneficiario }) => (
                <tr key={entrega.id}>
                  <td className="py-2 pr-4 text-slate-600">{entrega.data}</td>
                  <td className="py-2 pr-4 text-slate-900">
                    {doacao ? `${doacao.categoria} · ${doacao.quantidade} un.` : '—'}
                  </td>
                  <td className="py-2 pr-4 text-slate-900">{beneficiario?.nome ?? '—'}</td>
                  <td className="py-2 text-slate-600">{entrega.responsavel}</td>
                </tr>
              ))}
              {ultimasEntregas.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    Nenhuma entrega registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
