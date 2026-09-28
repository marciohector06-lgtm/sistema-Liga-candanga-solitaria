import type { Beneficiario, Doacao, Entrega } from './types'

export const SEED_DOACOES: Doacao[] = [
  { id: 'd1', categoria: 'Cesta básica', quantidade: 40, origem: 'Equipe Guará FS', data: '2026-09-05', status: 'Entregue' },
  { id: 'd2', categoria: 'Cesta básica', quantidade: 25, origem: 'Torcida Ceilândia', data: '2026-09-12', status: 'Disponível' },
  { id: 'd3', categoria: 'Bola', quantidade: 15, origem: 'Loja Esporte Total', data: '2026-09-08', status: 'Entregue' },
  { id: 'd4', categoria: 'Uniforme', quantidade: 20, origem: 'Equipe Taguatinga Sub-17', data: '2026-09-15', status: 'Disponível' },
  { id: 'd5', categoria: 'Rede', quantidade: 6, origem: 'Comércio local - Samambaia', data: '2026-09-18', status: 'Reservada' },
  { id: 'd6', categoria: 'Troféu', quantidade: 3, origem: 'Liga Candanga (estoque)', data: '2026-09-20', status: 'Disponível' },
]

export const SEED_BENEFICIARIOS: Beneficiario[] = [
  {
    id: 'b1',
    nome: 'Escolinha de Futsal do Guará (exemplo)',
    tipo: 'Escolinha',
    regiao: 'Guará',
    contato: '(61) 99999-0001',
    necessidade: 'Uniformes e bolas para a categoria sub-11',
    dataCadastro: '2026-09-04',
  },
  {
    id: 'b2',
    nome: 'Família Silva (exemplo)',
    tipo: 'Família',
    regiao: 'Ceilândia',
    contato: '(61) 99999-0002',
    necessidade: 'Cesta básica mensal',
    dataCadastro: '2026-09-06',
  },
  {
    id: 'b3',
    nome: 'Associação Comunitária de Samambaia (exemplo)',
    tipo: 'Instituição',
    regiao: 'Samambaia',
    contato: '(61) 99999-0003',
    necessidade: 'Redes de gol e materiais de manutenção da quadra',
    dataCadastro: '2026-09-10',
  },
]

export const SEED_ENTREGAS: Entrega[] = [
  { id: 'e1', doacaoId: 'd1', beneficiarioId: 'b2', data: '2026-09-07', responsavel: 'Márcio Sodré' },
  { id: 'e2', doacaoId: 'd3', beneficiarioId: 'b1', data: '2026-09-09', responsavel: 'Márcio Sodré' },
]
