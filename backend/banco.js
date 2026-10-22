import { ErroDeRegra } from './erros.js'
import { SEED_BENEFICIARIOS, SEED_DOACOES, SEED_ENTREGAS } from './seed.js'
import { supabase } from './supabase.js'

const COLUNAS_BENEFICIARIO = 'id, nome, tipo, regiao, contato, necessidade, data_cadastro'
const COLUNAS_DOACAO = 'id, categoria, quantidade, origem, data, status'
const COLUNAS_ENTREGA = 'id, doacao_id, beneficiario_id, data, responsavel'

const MENSAGEM_QUANTIDADE = 'Preencha a origem e uma quantidade inteira maior que zero.'
const MENSAGEM_BENEFICIARIO_INEXISTENTE = 'Beneficiário não encontrado.'

async function executar(consulta, mensagensPorCodigo = {}) {
  const { data, error, count } = await consulta
  if (error) {
    if (error.code === 'P0001') throw new ErroDeRegra(error.message)
    if (mensagensPorCodigo[error.code]) throw new ErroDeRegra(mensagensPorCodigo[error.code])
    throw new Error(`Supabase ${error.code}: ${error.message}`)
  }
  return count ?? data
}

function paraBeneficiario(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    tipo: linha.tipo,
    regiao: linha.regiao,
    contato: linha.contato,
    necessidade: linha.necessidade,
    dataCadastro: linha.data_cadastro,
  }
}

function paraLinhaBeneficiario(beneficiario) {
  return {
    id: beneficiario.id,
    nome: beneficiario.nome,
    tipo: beneficiario.tipo,
    regiao: beneficiario.regiao,
    contato: beneficiario.contato,
    necessidade: beneficiario.necessidade,
    data_cadastro: beneficiario.dataCadastro,
  }
}

function paraDoacao(linha) {
  return {
    id: linha.id,
    categoria: linha.categoria,
    quantidade: linha.quantidade,
    origem: linha.origem,
    data: linha.data,
    status: linha.status,
  }
}

function paraEntrega(linha) {
  return {
    id: linha.id,
    doacaoId: linha.doacao_id,
    beneficiarioId: linha.beneficiario_id,
    data: linha.data,
    responsavel: linha.responsavel,
  }
}

function paraLinhaEntrega(entrega) {
  return {
    id: entrega.id,
    doacao_id: entrega.doacaoId,
    beneficiario_id: entrega.beneficiarioId,
    data: entrega.data,
    responsavel: entrega.responsavel,
  }
}

export function dadosExemplo() {
  return structuredClone({ doacoes: SEED_DOACOES, beneficiarios: SEED_BENEFICIARIOS, entregas: SEED_ENTREGAS })
}

export async function listarBeneficiarios() {
  const linhas = await executar(supabase.from('beneficiarios').select(COLUNAS_BENEFICIARIO).order('ordem', { ascending: false }))
  return linhas.map(paraBeneficiario)
}

export async function buscarBeneficiario(id) {
  const linha = await executar(supabase.from('beneficiarios').select(COLUNAS_BENEFICIARIO).eq('id', id).maybeSingle())
  return linha && paraBeneficiario(linha)
}

export async function criarBeneficiario(beneficiario) {
  const linha = await executar(
    supabase.from('beneficiarios').insert(paraLinhaBeneficiario(beneficiario)).select(COLUNAS_BENEFICIARIO).single(),
  )
  return paraBeneficiario(linha)
}

export async function atualizarBeneficiario(id, { nome, tipo, regiao, contato, necessidade }) {
  const linha = await executar(
    supabase
      .from('beneficiarios')
      .update({ nome, tipo, regiao, contato, necessidade })
      .eq('id', id)
      .select(COLUNAS_BENEFICIARIO)
      .single(),
  )
  return paraBeneficiario(linha)
}

export async function contarEntregasDoBeneficiario(id) {
  return executar(supabase.from('entregas').select('id', { count: 'exact', head: true }).eq('beneficiario_id', id))
}

export async function removerBeneficiario(id) {
  await executar(supabase.from('beneficiarios').delete().eq('id', id), {
    23503: 'Este beneficiário tem entrega(s) registrada(s). Remova as entregas antes.',
  })
}

export async function listarDoacoes() {
  const linhas = await executar(supabase.from('doacoes').select(COLUNAS_DOACAO).order('ordem', { ascending: false }))
  return linhas.map(paraDoacao)
}

export async function buscarDoacao(id) {
  const linha = await executar(supabase.from('doacoes').select(COLUNAS_DOACAO).eq('id', id).maybeSingle())
  return linha && paraDoacao(linha)
}

export async function criarDoacao(doacao) {
  const linha = await executar(supabase.from('doacoes').insert(doacao).select(COLUNAS_DOACAO).single(), {
    22003: MENSAGEM_QUANTIDADE,
  })
  return paraDoacao(linha)
}

export async function atualizarDoacao(id, { categoria, quantidade, origem, data, status }) {
  const linha = await executar(
    supabase
      .from('doacoes')
      .update({ categoria, quantidade, origem, data, status })
      .eq('id', id)
      .select(COLUNAS_DOACAO)
      .single(),
    { 22003: MENSAGEM_QUANTIDADE, 23502: 'Selecione um status válido.', 23514: 'Selecione um status válido.' },
  )
  return paraDoacao(linha)
}

export async function doacaoTemEntrega(id) {
  const quantidade = await executar(supabase.from('entregas').select('id', { count: 'exact', head: true }).eq('doacao_id', id))
  return quantidade > 0
}

export async function removerDoacao(id) {
  await executar(supabase.from('doacoes').delete().eq('id', id), {
    23503: 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.',
  })
}

export async function listarEntregas() {
  const linhas = await executar(supabase.from('entregas').select(COLUNAS_ENTREGA).order('ordem', { ascending: false }))
  return linhas.map(paraEntrega)
}

export async function buscarEntrega(id) {
  const linha = await executar(supabase.from('entregas').select(COLUNAS_ENTREGA).eq('id', id).maybeSingle())
  return linha && paraEntrega(linha)
}

export async function registrarEntrega({ id, doacaoId, beneficiarioId, data, responsavel }) {
  const linha = await executar(
    supabase.rpc('registrar_entrega', {
      p_id: id,
      p_doacao_id: doacaoId,
      p_beneficiario_id: beneficiarioId,
      p_data: data,
      p_responsavel: responsavel,
    }),
    { 23503: MENSAGEM_BENEFICIARIO_INEXISTENTE, 23505: 'Esta doação não está disponível para entrega.' },
  )
  return paraEntrega(linha)
}

export async function atualizarEntrega(id, { beneficiarioId, data, responsavel }) {
  const linha = await executar(
    supabase
      .from('entregas')
      .update({ beneficiario_id: beneficiarioId, data, responsavel })
      .eq('id', id)
      .select(COLUNAS_ENTREGA)
      .single(),
    { 23503: MENSAGEM_BENEFICIARIO_INEXISTENTE },
  )
  return paraEntrega(linha)
}

export async function removerEntrega(id) {
  return executar(supabase.rpc('remover_entrega', { p_id: id }))
}

export async function apagarTudo() {
  await executar(supabase.rpc('apagar_tudo'))
}

export async function restaurarExemplo() {
  const { doacoes, beneficiarios, entregas } = dadosExemplo()
  await executar(
    supabase.rpc('restaurar_exemplo', {
      p_dados: {
        beneficiarios: beneficiarios.reverse().map(paraLinhaBeneficiario),
        doacoes: doacoes.reverse(),
        entregas: entregas.reverse().map(paraLinhaEntrega),
      },
    }),
  )
}
