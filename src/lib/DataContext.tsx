import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { hojeLocal } from './datas'
import { SEED_BENEFICIARIOS, SEED_DOACOES, SEED_ENTREGAS } from './seed'
import {
  CATEGORIAS_DOACAO,
  type Beneficiario,
  type CategoriaDoacao,
  type Doacao,
  type Entrega,
  type RegiaoAdministrativa,
  type ResumoImpacto,
} from './types'

const STORAGE_KEY = 'liga-candanga-solidaria:v1'

interface EstadoPersistido {
  doacoes: Doacao[]
  beneficiarios: Beneficiario[]
  entregas: Entrega[]
}

function estadoExemplo(): EstadoPersistido {
  return { doacoes: SEED_DOACOES, beneficiarios: SEED_BENEFICIARIOS, entregas: SEED_ENTREGAS }
}

function carregarEstadoInicial(): EstadoPersistido {
  const bruto = window.localStorage.getItem(STORAGE_KEY)
  if (!bruto) return estadoExemplo()
  try {
    const salvo = JSON.parse(bruto) as Partial<EstadoPersistido> | null
    // Dados salvos incompletos (formato antigo, edição manual) derrubariam o app com tela branca.
    if (!salvo || !Array.isArray(salvo.doacoes) || !Array.isArray(salvo.beneficiarios) || !Array.isArray(salvo.entregas)) {
      return estadoExemplo()
    }
    return { doacoes: salvo.doacoes, beneficiarios: salvo.beneficiarios, entregas: salvo.entregas }
  } catch {
    return estadoExemplo()
  }
}

function gerarId(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface DataContextValue {
  doacoes: Doacao[]
  beneficiarios: Beneficiario[]
  entregas: Entrega[]
  resumo: ResumoImpacto
  adicionarDoacao: (input: Omit<Doacao, 'id' | 'status'>) => void
  adicionarBeneficiario: (input: Omit<Beneficiario, 'id' | 'dataCadastro'>) => void
  registrarEntrega: (input: Omit<Entrega, 'id'>) => void
  // Edição/remoção (área de Configurações): devolvem uma mensagem de erro quando a regra
  // de negócio impede a operação, ou null quando deu certo.
  atualizarDoacao: (id: string, dados: Omit<Doacao, 'id'>) => string | null
  removerDoacao: (id: string) => string | null
  atualizarBeneficiario: (id: string, dados: Omit<Beneficiario, 'id' | 'dataCadastro'>) => string | null
  removerBeneficiario: (id: string) => string | null
  atualizarEntrega: (id: string, dados: Pick<Entrega, 'beneficiarioId' | 'data' | 'responsavel'>) => string | null
  removerEntrega: (id: string) => void
  resetarDadosExemplo: () => void
  apagarTodosOsDados: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPersistido>(carregarEstadoInicial)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  }, [estado])

  const adicionarDoacao: DataContextValue['adicionarDoacao'] = (input) => {
    setEstado((atual) => ({
      ...atual,
      doacoes: [{ ...input, id: gerarId('doacao'), status: 'Disponível' }, ...atual.doacoes],
    }))
  }

  const adicionarBeneficiario: DataContextValue['adicionarBeneficiario'] = (input) => {
    setEstado((atual) => ({
      ...atual,
      beneficiarios: [
        { ...input, id: gerarId('beneficiario'), dataCadastro: hojeLocal() },
        ...atual.beneficiarios,
      ],
    }))
  }

  const registrarEntrega: DataContextValue['registrarEntrega'] = (input) => {
    setEstado((atual) => ({
      ...atual,
      entregas: [{ ...input, id: gerarId('entrega') }, ...atual.entregas],
      doacoes: atual.doacoes.map((doacao) =>
        doacao.id === input.doacaoId ? { ...doacao, status: 'Entregue' } : doacao,
      ),
    }))
  }

  const atualizarDoacao: DataContextValue['atualizarDoacao'] = (id, dados) => {
    if (!dados.origem.trim() || !Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      return 'Preencha a origem e uma quantidade inteira maior que zero.'
    }
    const entrega = estado.entregas.find((e) => e.doacaoId === id)
    if (entrega && dados.status !== 'Entregue') {
      return 'Esta doação já tem uma entrega registrada. Remova a entrega para mudar o status.'
    }
    if (!entrega && dados.status === 'Entregue') {
      return 'Para marcar como Entregue, registre uma entrega na tela de Entregas.'
    }
    if (entrega && dados.data > entrega.data) {
      return `A data de recebimento não pode ser posterior à entrega (${entrega.data}).`
    }
    setEstado((atual) => ({
      ...atual,
      doacoes: atual.doacoes.map((d) => (d.id === id ? { ...dados, id } : d)),
    }))
    return null
  }

  const removerDoacao: DataContextValue['removerDoacao'] = (id) => {
    if (estado.entregas.some((e) => e.doacaoId === id)) {
      return 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.'
    }
    setEstado((atual) => ({ ...atual, doacoes: atual.doacoes.filter((d) => d.id !== id) }))
    return null
  }

  const atualizarBeneficiario: DataContextValue['atualizarBeneficiario'] = (id, dados) => {
    if (!dados.nome.trim()) return 'O nome é obrigatório.'
    setEstado((atual) => ({
      ...atual,
      beneficiarios: atual.beneficiarios.map((b) => (b.id === id ? { ...b, ...dados } : b)),
    }))
    return null
  }

  const removerBeneficiario: DataContextValue['removerBeneficiario'] = (id) => {
    const quantidade = estado.entregas.filter((e) => e.beneficiarioId === id).length
    if (quantidade > 0) {
      return `Este beneficiário tem ${quantidade} entrega(s) registrada(s). Remova as entregas antes.`
    }
    setEstado((atual) => ({ ...atual, beneficiarios: atual.beneficiarios.filter((b) => b.id !== id) }))
    return null
  }

  const atualizarEntrega: DataContextValue['atualizarEntrega'] = (id, dados) => {
    if (!dados.responsavel.trim()) return 'Informe o responsável pela entrega.'
    const entrega = estado.entregas.find((e) => e.id === id)
    const doacao = estado.doacoes.find((d) => d.id === entrega?.doacaoId)
    if (doacao && dados.data < doacao.data) {
      return `A data da entrega não pode ser anterior ao recebimento da doação (${doacao.data}).`
    }
    setEstado((atual) => ({
      ...atual,
      entregas: atual.entregas.map((e) => (e.id === id ? { ...e, ...dados } : e)),
    }))
    return null
  }

  // Desfazer uma entrega devolve a doação para o estoque.
  const removerEntrega: DataContextValue['removerEntrega'] = (id) => {
    setEstado((atual) => {
      const entrega = atual.entregas.find((e) => e.id === id)
      return {
        ...atual,
        entregas: atual.entregas.filter((e) => e.id !== id),
        doacoes: atual.doacoes.map((d) => (d.id === entrega?.doacaoId ? { ...d, status: 'Disponível' } : d)),
      }
    })
  }

  const resetarDadosExemplo = () => {
    setEstado(estadoExemplo())
  }

  const apagarTodosOsDados = () => {
    setEstado({ doacoes: [], beneficiarios: [], entregas: [] })
  }

  const resumo = useMemo<ResumoImpacto>(() => {
    const doacoesPorCategoria = CATEGORIAS_DOACAO.reduce(
      (acc, categoria) => {
        acc[categoria] = estado.doacoes.filter((d) => d.categoria === categoria).length
        return acc
      },
      {} as Record<CategoriaDoacao, number>,
    )

    const beneficiariosPorRegiao = estado.beneficiarios.reduce(
      (acc, beneficiario) => {
        acc[beneficiario.regiao] = (acc[beneficiario.regiao] ?? 0) + 1
        return acc
      },
      {} as Partial<Record<RegiaoAdministrativa, number>>,
    )

    return {
      totalDoacoes: estado.doacoes.length,
      doacoesDisponiveis: estado.doacoes.filter((d) => d.status === 'Disponível').length,
      totalBeneficiarios: estado.beneficiarios.length,
      totalEntregas: estado.entregas.length,
      doacoesPorCategoria,
      beneficiariosPorRegiao,
    }
  }, [estado])

  const value: DataContextValue = {
    doacoes: estado.doacoes,
    beneficiarios: estado.beneficiarios,
    entregas: estado.entregas,
    resumo,
    adicionarDoacao,
    adicionarBeneficiario,
    registrarEntrega,
    atualizarDoacao,
    removerDoacao,
    atualizarBeneficiario,
    removerBeneficiario,
    atualizarEntrega,
    removerEntrega,
    resetarDadosExemplo,
    apagarTodosOsDados,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const contexto = useContext(DataContext)
  if (!contexto) {
    throw new Error('useData precisa ser usado dentro de DataProvider')
  }
  return contexto
}
