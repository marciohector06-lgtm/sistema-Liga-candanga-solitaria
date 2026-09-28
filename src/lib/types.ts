export type CategoriaDoacao =
  | 'Cesta básica'
  | 'Bola'
  | 'Rede'
  | 'Troféu'
  | 'Uniforme'

export type StatusDoacao = 'Disponível' | 'Reservada' | 'Entregue'

export type TipoBeneficiario = 'Família' | 'Escolinha' | 'Instituição'

export const CATEGORIAS_DOACAO: CategoriaDoacao[] = ['Cesta básica', 'Bola', 'Rede', 'Troféu', 'Uniforme']

export const STATUS_DOACAO: StatusDoacao[] = ['Disponível', 'Reservada', 'Entregue']

export const TIPOS_BENEFICIARIO: TipoBeneficiario[] = ['Família', 'Escolinha', 'Instituição']

export const REGIOES_ADMINISTRATIVAS_DF = [
  'Ceilândia',
  'Guará',
  'Taguatinga',
  'Samambaia',
  'Planaltina',
  'Recanto das Emas',
  'Santa Maria',
  'São Sebastião',
] as const

export type RegiaoAdministrativa = (typeof REGIOES_ADMINISTRATIVAS_DF)[number]

export interface Doacao {
  id: string
  categoria: CategoriaDoacao
  quantidade: number
  origem: string
  data: string
  status: StatusDoacao
}

export interface Beneficiario {
  id: string
  nome: string
  tipo: TipoBeneficiario
  regiao: RegiaoAdministrativa
  contato: string
  necessidade: string
  dataCadastro: string
}

export interface Entrega {
  id: string
  doacaoId: string
  beneficiarioId: string
  data: string
  responsavel: string
}

export interface ResumoImpacto {
  totalDoacoes: number
  doacoesDisponiveis: number
  totalBeneficiarios: number
  totalEntregas: number
  doacoesPorCategoria: Record<CategoriaDoacao, number>
  beneficiariosPorRegiao: Partial<Record<RegiaoAdministrativa, number>>
}
