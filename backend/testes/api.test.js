import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, test } from 'node:test'
import { createClient } from '@supabase/supabase-js'
import express from 'express'
import { responderErro, ErroDeRegra } from '../erros.js'
import beneficiarios from '../rotas/beneficiarios.js'
import cadastros from '../rotas/cadastros.js'
import doacoes from '../rotas/doacoes.js'
import entregas from '../rotas/entregas.js'
import resumo from '../rotas/resumo.js'
import sistema from '../rotas/sistema.js'
import { SEED_BENEFICIARIOS, SEED_DOACOES, SEED_ENTREGAS } from '../seed.js'
import { dataValida, hojeLocal } from '../util.js'

let servidor
let base

before(async () => {
  const app = express()
  app.use(express.json())
  app.use('/api/doacoes', doacoes)
  app.use('/api/beneficiarios', beneficiarios)
  app.use('/api/entregas', entregas)
  app.use('/api/resumo', resumo)
  app.use('/api/sistema', sistema)
  app.use('/api/cadastros', cadastros)
  await new Promise((resolver) => {
    servidor = app.listen(0, resolver)
  })
  base = `http://127.0.0.1:${servidor.address().port}/api`
})

after(() => {
  servidor.close()
})

async function chamar(metodo, rota, corpo) {
  const resposta = await fetch(`${base}/${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  const texto = await resposta.text()
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null }
}

async function restaurarExemplo() {
  const { status } = await chamar('POST', 'sistema/restaurar-exemplo')
  assert.equal(status, 204)
}

async function apagarTudo() {
  const { status } = await chamar('POST', 'sistema/apagar-tudo')
  assert.equal(status, 204)
}

async function criarBeneficiario(campos = {}) {
  const { status, corpo } = await chamar('POST', 'beneficiarios', {
    nome: 'Escolinha Teste',
    tipo: 'Escolinha',
    regiao: 'Guará',
    contato: '',
    necessidade: '',
    ...campos,
  })
  assert.equal(status, 201)
  return corpo
}

async function criarDoacao(campos = {}) {
  const { status, corpo } = await chamar('POST', 'doacoes', {
    categoria: 'Bola',
    quantidade: 10,
    origem: 'Equipe Teste',
    data: '2026-10-01',
    ...campos,
  })
  assert.equal(status, 201)
  return corpo
}

async function registrarEntrega(doacao, beneficiario, campos = {}) {
  return chamar('POST', 'entregas', {
    doacaoId: doacao.id,
    beneficiarioId: beneficiario.id,
    data: '2026-10-05',
    responsavel: 'Responsável Teste',
    ...campos,
  })
}

describe('Beneficiários', () => {
  beforeEach(apagarTudo)

  test('RN01: recusa nome vazio ou só com espaços', async () => {
    for (const nome of [undefined, '', '   ']) {
      const { status, corpo } = await chamar('POST', 'beneficiarios', { nome, tipo: 'Família', regiao: 'Guará' })
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'O nome é obrigatório.' })
    }
  })

  test('RN01, RN02, RN04, RN28: cadastra com nome aparado, data de cadastro do servidor e campos opcionais', async () => {
    const { status, corpo } = await chamar('POST', 'beneficiarios', {
      nome: '  Família Teste  ',
      tipo: 'Família',
      regiao: 'Ceilândia',
      dataCadastro: '2000-01-01',
    })
    assert.equal(status, 201)
    assert.match(corpo.id, /^beneficiario-[0-9a-z]+-[0-9a-z]{1,5}$/)
    assert.deepEqual(Object.keys(corpo), ['id', 'nome', 'tipo', 'regiao', 'contato', 'necessidade', 'dataCadastro'])
    assert.equal(corpo.nome, 'Família Teste')
    assert.equal(corpo.dataCadastro, hojeLocal())
    assert.equal(corpo.contato, '')
    assert.equal(corpo.necessidade, '')
  })

  test('RN03: recusa tipo ou região fora das listas', async () => {
    for (const campos of [{ tipo: 'Empresa', regiao: 'Guará' }, { tipo: 'Família', regiao: 'Região Inexistente' }]) {
      const { status, corpo } = await chamar('POST', 'beneficiarios', { nome: 'X', ...campos })
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'Selecione um tipo e uma região administrativa válidos.' })
    }
  })

  test('RF02: lista do cadastro mais recente para o mais antigo', async () => {
    const primeiro = await criarBeneficiario({ nome: 'Primeiro' })
    const segundo = await criarBeneficiario({ nome: 'Segundo' })
    const { status, corpo } = await chamar('GET', 'beneficiarios')
    assert.equal(status, 200)
    assert.deepEqual(corpo.map((b) => b.id), [segundo.id, primeiro.id])
  })

  test('RN01, RN02: edita campos sem alterar a data de cadastro', async () => {
    const beneficiario = await criarBeneficiario()
    const { status, corpo } = await chamar('PUT', `beneficiarios/${beneficiario.id}`, {
      nome: ' Novo Nome ',
      tipo: 'Instituição',
      regiao: 'Samambaia',
      contato: '(61) 90000-0000',
      necessidade: 'Redes',
      dataCadastro: '2000-01-01',
    })
    assert.equal(status, 200)
    assert.deepEqual(corpo, {
      ...beneficiario,
      nome: 'Novo Nome',
      tipo: 'Instituição',
      regiao: 'Samambaia',
      contato: '(61) 90000-0000',
      necessidade: 'Redes',
    })
  })

  test('PUT: 404 para beneficiário inexistente e 400 sem nome', async () => {
    const inexistente = await chamar('PUT', 'beneficiarios/nao-existe', { nome: '', tipo: 'Família', regiao: 'Guará' })
    assert.equal(inexistente.status, 404)
    assert.deepEqual(inexistente.corpo, { erro: 'Beneficiário não encontrado.' })

    const beneficiario = await criarBeneficiario()
    const semNome = await chamar('PUT', `beneficiarios/${beneficiario.id}`, { nome: ' ', tipo: 'Família', regiao: 'Guará' })
    assert.equal(semNome.status, 400)
    assert.deepEqual(semNome.corpo, { erro: 'O nome é obrigatório.' })
  })

  test('RN22: não remove beneficiário com entregas; remove sem entregas', async () => {
    const beneficiario = await criarBeneficiario()
    await registrarEntrega(await criarDoacao(), beneficiario)
    await registrarEntrega(await criarDoacao(), beneficiario)

    const bloqueado = await chamar('DELETE', `beneficiarios/${beneficiario.id}`)
    assert.equal(bloqueado.status, 400)
    assert.deepEqual(bloqueado.corpo, { erro: 'Este beneficiário tem 2 entrega(s) registrada(s). Remova as entregas antes.' })

    const livre = await criarBeneficiario({ nome: 'Sem entregas' })
    const removido = await chamar('DELETE', `beneficiarios/${livre.id}`)
    assert.equal(removido.status, 204)
    const { corpo } = await chamar('GET', 'beneficiarios')
    assert.deepEqual(corpo.map((b) => b.id), [beneficiario.id])
  })

  test('DELETE: beneficiário inexistente responde 204', async () => {
    const { status } = await chamar('DELETE', 'beneficiarios/nao-existe')
    assert.equal(status, 204)
  })
})

describe('Doações', () => {
  beforeEach(apagarTudo)

  test('RN05: recusa origem vazia e quantidade não inteira, zero, negativa ou em texto', async () => {
    const casos = [
      { origem: '  ', quantidade: 5 },
      { origem: 'X', quantidade: 0 },
      { origem: 'X', quantidade: -3 },
      { origem: 'X', quantidade: 2.5 },
      { origem: 'X', quantidade: '5' },
      { origem: 'X', quantidade: 3000000000 },
    ]
    for (const caso of casos) {
      const { status, corpo } = await chamar('POST', 'doacoes', { categoria: 'Bola', data: '2026-10-01', ...caso })
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'Preencha a origem e uma quantidade inteira maior que zero.' })
    }
  })

  test('RN06: recusa categoria fora da lista', async () => {
    const { status, corpo } = await chamar('POST', 'doacoes', { categoria: 'Chuteira', quantidade: 1, origem: 'X', data: '2026-10-01' })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'Selecione uma categoria válida.' })
  })

  test('Recusa doação sem data de recebimento válida', async () => {
    for (const data of [undefined, '', '2026-02-30', '01/10/2026']) {
      const { status, corpo } = await chamar('POST', 'doacoes', { categoria: 'Bola', quantidade: 1, origem: 'X', data })
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'Informe uma data de recebimento válida.' })
    }
  })

  test('RN07, RN28: nasce Disponível mesmo se outro status for enviado, com origem aparada', async () => {
    const { status, corpo } = await chamar('POST', 'doacoes', {
      categoria: 'Uniforme',
      quantidade: 20,
      origem: '  Torcida  ',
      data: '2026-10-02',
      status: 'Entregue',
    })
    assert.equal(status, 201)
    assert.match(corpo.id, /^doacao-[0-9a-z]+-[0-9a-z]{1,5}$/)
    assert.deepEqual(corpo, { id: corpo.id, categoria: 'Uniforme', quantidade: 20, origem: 'Torcida', data: '2026-10-02', status: 'Disponível' })
  })

  test('RN08: alterna entre Disponível e Reservada pela edição', async () => {
    const doacao = await criarDoacao()
    const reservada = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, status: 'Reservada' })
    assert.equal(reservada.status, 200)
    assert.equal(reservada.corpo.status, 'Reservada')
    const disponivel = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, status: 'Disponível', quantidade: 12 })
    assert.equal(disponivel.status, 200)
    assert.deepEqual(disponivel.corpo, { ...doacao, quantidade: 12, status: 'Disponível' })
  })

  test('RN08: recusa status fora da lista', async () => {
    const doacao = await criarDoacao()
    const { status, corpo } = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, status: 'Perdida' })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'Selecione um status válido.' })
  })

  test('RN09: não marca como Entregue sem entrega', async () => {
    const doacao = await criarDoacao()
    const { status, corpo } = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, status: 'Entregue' })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'Para marcar como Entregue, registre uma entrega na tela de Entregas.' })
  })

  test('RN10: não muda o status de doação com entrega', async () => {
    const doacao = await criarDoacao()
    await registrarEntrega(doacao, await criarBeneficiario())
    for (const status of ['Disponível', 'Reservada']) {
      const resposta = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, status })
      assert.equal(resposta.status, 400)
      assert.deepEqual(resposta.corpo, { erro: 'Esta doação já tem uma entrega registrada. Remova a entrega para mudar o status.' })
    }
  })

  test('RN11: data de recebimento não pode passar da data da entrega', async () => {
    const doacao = await criarDoacao({ data: '2026-10-01' })
    await registrarEntrega(doacao, await criarBeneficiario(), { data: '2026-10-05' })
    const recusada = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, data: '2026-10-06', status: 'Entregue' })
    assert.equal(recusada.status, 400)
    assert.deepEqual(recusada.corpo, { erro: 'A data de recebimento não pode ser posterior à entrega (2026-10-05).' })

    const aceita = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, data: '2026-10-05', origem: 'Nova origem', status: 'Entregue' })
    assert.equal(aceita.status, 200)
    assert.deepEqual(aceita.corpo, { ...doacao, data: '2026-10-05', origem: 'Nova origem', status: 'Entregue' })
  })

  test('PUT: 404 para doação inexistente e RN05 na edição', async () => {
    const inexistente = await chamar('PUT', 'doacoes/nao-existe', { categoria: 'Bola', quantidade: 1, origem: 'X', data: '2026-10-01' })
    assert.equal(inexistente.status, 404)
    assert.deepEqual(inexistente.corpo, { erro: 'Doação não encontrada.' })

    const doacao = await criarDoacao()
    const invalida = await chamar('PUT', `doacoes/${doacao.id}`, { ...doacao, quantidade: 0 })
    assert.equal(invalida.status, 400)
    assert.deepEqual(invalida.corpo, { erro: 'Preencha a origem e uma quantidade inteira maior que zero.' })
  })

  test('RN21: não remove doação com entrega; remove as demais, inclusive Reservada', async () => {
    const entregue = await criarDoacao()
    await registrarEntrega(entregue, await criarBeneficiario())
    const bloqueada = await chamar('DELETE', `doacoes/${entregue.id}`)
    assert.equal(bloqueada.status, 400)
    assert.deepEqual(bloqueada.corpo, { erro: 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.' })

    const reservada = await criarDoacao()
    await chamar('PUT', `doacoes/${reservada.id}`, { ...reservada, status: 'Reservada' })
    assert.equal((await chamar('DELETE', `doacoes/${reservada.id}`)).status, 204)
    assert.equal((await chamar('DELETE', 'doacoes/nao-existe')).status, 204)

    const { corpo } = await chamar('GET', 'doacoes')
    assert.deepEqual(corpo.map((d) => d.id), [entregue.id])
  })
})

describe('Entregas', () => {
  beforeEach(apagarTudo)

  test('RN13: exige doação, beneficiário e responsável', async () => {
    const doacao = await criarDoacao()
    const beneficiario = await criarBeneficiario()
    const casos = [{ doacaoId: '' }, { beneficiarioId: '' }, { responsavel: '' }, { responsavel: '   ' }]
    for (const caso of casos) {
      const { status, corpo } = await registrarEntrega(doacao, beneficiario, caso)
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'Selecione a doação, o beneficiário e informe o responsável.' })
    }
  })

  test('Recusa entrega sem data válida', async () => {
    const { status, corpo } = await registrarEntrega(await criarDoacao(), await criarBeneficiario(), { data: undefined })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'Informe uma data de entrega válida.' })
  })

  test('RN14: só entrega doação Disponível', async () => {
    const beneficiario = await criarBeneficiario()
    const reservada = await criarDoacao()
    await chamar('PUT', `doacoes/${reservada.id}`, { ...reservada, status: 'Reservada' })
    for (const doacaoId of [reservada.id, 'nao-existe']) {
      const { status, corpo } = await chamar('POST', 'entregas', {
        doacaoId,
        beneficiarioId: beneficiario.id,
        data: '2026-10-05',
        responsavel: 'X',
      })
      assert.equal(status, 400)
      assert.deepEqual(corpo, { erro: 'Esta doação não está disponível para entrega.' })
    }
  })

  test('RN15: data da entrega não pode ser anterior ao recebimento', async () => {
    const doacao = await criarDoacao({ data: '2026-10-01' })
    const { status, corpo } = await registrarEntrega(doacao, await criarBeneficiario(), { data: '2026-09-30' })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'A data da entrega não pode ser anterior ao recebimento da doação (2026-10-01).' })
    const { corpo: lista } = await chamar('GET', 'doacoes')
    assert.equal(lista[0].status, 'Disponível')
  })

  test('RN16, RN28: registra a entrega e marca a doação como Entregue', async () => {
    const doacao = await criarDoacao()
    const beneficiario = await criarBeneficiario()
    const { status, corpo } = await registrarEntrega(doacao, beneficiario, { responsavel: '  Márcio  ', data: '2026-10-01' })
    assert.equal(status, 201)
    assert.match(corpo.id, /^entrega-[0-9a-z]+-[0-9a-z]{1,5}$/)
    assert.deepEqual(corpo, { id: corpo.id, doacaoId: doacao.id, beneficiarioId: beneficiario.id, data: '2026-10-01', responsavel: 'Márcio' })
    const { corpo: lista } = await chamar('GET', 'doacoes')
    assert.equal(lista[0].status, 'Entregue')
  })

  test('RN17: a mesma doação não é entregue duas vezes, nem em chamadas simultâneas', async () => {
    const doacao = await criarDoacao()
    const beneficiario = await criarBeneficiario()
    const respostas = await Promise.all([registrarEntrega(doacao, beneficiario), registrarEntrega(doacao, beneficiario)])
    assert.deepEqual(respostas.map((r) => r.status).sort(), [201, 400])
    assert.deepEqual(respostas.find((r) => r.status === 400).corpo, { erro: 'Esta doação não está disponível para entrega.' })
    const { corpo } = await chamar('GET', 'entregas')
    assert.equal(corpo.length, 1)
  })

  test('Recusa beneficiário inexistente e não altera a doação', async () => {
    const doacao = await criarDoacao()
    const { status, corpo } = await registrarEntrega(doacao, { id: 'nao-existe' })
    assert.equal(status, 400)
    assert.deepEqual(corpo, { erro: 'Beneficiário não encontrado.' })
    const { corpo: lista } = await chamar('GET', 'doacoes')
    assert.equal(lista[0].status, 'Disponível')
  })

  test('RN18, RN19, RN15: edição troca beneficiário, data e responsável, mas não a doação', async () => {
    const doacao = await criarDoacao({ data: '2026-10-01' })
    const outraDoacao = await criarDoacao()
    const beneficiario = await criarBeneficiario()
    const outroBeneficiario = await criarBeneficiario({ nome: 'Outro' })
    const { corpo: entrega } = await registrarEntrega(doacao, beneficiario)

    const semResponsavel = await chamar('PUT', `entregas/${entrega.id}`, { ...entrega, responsavel: ' ' })
    assert.equal(semResponsavel.status, 400)
    assert.deepEqual(semResponsavel.corpo, { erro: 'Informe o responsável pela entrega.' })

    const dataAnterior = await chamar('PUT', `entregas/${entrega.id}`, { ...entrega, data: '2026-09-01' })
    assert.equal(dataAnterior.status, 400)
    assert.deepEqual(dataAnterior.corpo, { erro: 'A data da entrega não pode ser anterior ao recebimento da doação (2026-10-01).' })

    const beneficiarioInexistente = await chamar('PUT', `entregas/${entrega.id}`, { ...entrega, beneficiarioId: 'nao-existe' })
    assert.equal(beneficiarioInexistente.status, 400)
    assert.deepEqual(beneficiarioInexistente.corpo, { erro: 'Beneficiário não encontrado.' })

    const editada = await chamar('PUT', `entregas/${entrega.id}`, {
      doacaoId: outraDoacao.id,
      beneficiarioId: outroBeneficiario.id,
      data: '2026-10-09',
      responsavel: ' Nova pessoa ',
    })
    assert.equal(editada.status, 200)
    assert.deepEqual(editada.corpo, { id: entrega.id, doacaoId: doacao.id, beneficiarioId: outroBeneficiario.id, data: '2026-10-09', responsavel: 'Nova pessoa' })

    const inexistente = await chamar('PUT', 'entregas/nao-existe', { ...entrega })
    assert.equal(inexistente.status, 404)
    assert.deepEqual(inexistente.corpo, { erro: 'Entrega não encontrada.' })
  })

  test('RN23: remover entrega devolve a doação para Disponível', async () => {
    const doacao = await criarDoacao()
    const { corpo: entrega } = await registrarEntrega(doacao, await criarBeneficiario())
    assert.equal((await chamar('DELETE', `entregas/${entrega.id}`)).status, 204)
    const { corpo: lista } = await chamar('GET', 'doacoes')
    assert.equal(lista[0].status, 'Disponível')
    assert.deepEqual((await chamar('GET', 'entregas')).corpo, [])

    const inexistente = await chamar('DELETE', 'entregas/nao-existe')
    assert.equal(inexistente.status, 404)
    assert.deepEqual(inexistente.corpo, { erro: 'Entrega não encontrada.' })
  })
})

describe('Sistema e resumo', () => {
  test('RN25: restaurar exemplo devolve exatamente os dados de demonstração, na ordem da v2', async () => {
    await criarDoacao()
    await restaurarExemplo()
    assert.deepEqual((await chamar('GET', 'doacoes')).corpo, SEED_DOACOES)
    assert.deepEqual((await chamar('GET', 'beneficiarios')).corpo, SEED_BENEFICIARIOS)
    assert.deepEqual((await chamar('GET', 'entregas')).corpo, SEED_ENTREGAS)
  })

  test('RN26, RN27: resumo conta registros, não unidades', async () => {
    await restaurarExemplo()
    const { status, corpo } = await chamar('GET', 'resumo')
    assert.equal(status, 200)
    assert.deepEqual(corpo, {
      totalDoacoes: 6,
      doacoesDisponiveis: 3,
      totalBeneficiarios: 3,
      totalEntregas: 2,
      doacoesPorCategoria: { 'Cesta básica': 2, Bola: 1, Rede: 1, Troféu: 1, Uniforme: 1 },
      beneficiariosPorRegiao: { Guará: 1, Ceilândia: 1, Samambaia: 1 },
    })
  })

  test('RN25: apagar tudo esvazia as três coleções e zera o resumo', async () => {
    await restaurarExemplo()
    await apagarTudo()
    for (const rota of ['doacoes', 'beneficiarios', 'entregas']) {
      assert.deepEqual((await chamar('GET', rota)).corpo, [])
    }
    assert.deepEqual((await chamar('GET', 'resumo')).corpo, {
      totalDoacoes: 0,
      doacoesDisponiveis: 0,
      totalBeneficiarios: 0,
      totalEntregas: 0,
      doacoesPorCategoria: { 'Cesta básica': 0, Bola: 0, Rede: 0, Troféu: 0, Uniforme: 0 },
      beneficiariosPorRegiao: {},
    })
  })
})

describe('Cadastros', () => {
  const criados = []

  async function criarItem(lista, nome) {
    const resposta = await chamar('POST', `cadastros/${lista}`, { nome })
    if (resposta.status === 201) criados.push([lista, resposta.corpo.nome])
    return resposta
  }

  beforeEach(apagarTudo)

  after(async () => {
    await restaurarExemplo()
    for (const [lista, nome] of criados) await chamar('DELETE', `cadastros/${lista}/${encodeURIComponent(nome)}`)
  })

  test('RF: lista categorias, tipos e regiões em ordem alfabética, com o uso de cada item', async () => {
    await restaurarExemplo()
    const { status, corpo } = await chamar('GET', 'cadastros')
    assert.equal(status, 200)
    assert.deepEqual(Object.keys(corpo), ['categorias', 'tipos', 'regioes'])
    assert.deepEqual(corpo.categorias, [
      { nome: 'Bola', uso: 1 },
      { nome: 'Cesta básica', uso: 2 },
      { nome: 'Rede', uso: 1 },
      { nome: 'Troféu', uso: 1 },
      { nome: 'Uniforme', uso: 1 },
    ])
    assert.deepEqual(corpo.tipos.map((item) => item.nome), ['Escolinha', 'Família', 'Instituição', 'Time'])
    assert.equal(corpo.regioes.length, 38)
    assert.ok(corpo.regioes.some((item) => item.nome === 'Não informada'))
    assert.deepEqual(corpo.regioes.find((item) => item.nome === 'Guará'), { nome: 'Guará', uso: 1 })
  })

  test('RF: categoria nova é aceita na doação e aparece no resumo', async () => {
    const { status, corpo } = await criarItem('categorias', '  Medalha  ')
    assert.equal(status, 201)
    assert.deepEqual(corpo, { nome: 'Medalha', uso: 0 })
    const doacao = await criarDoacao({ categoria: 'Medalha' })
    assert.equal(doacao.categoria, 'Medalha')
    assert.equal((await chamar('GET', 'resumo')).corpo.doacoesPorCategoria.Medalha, 1)
  })

  test('RF: tipo "Time" e região nova são aceitos no beneficiário', async () => {
    await criarItem('regioes', 'Formosa (GO)')
    const time = await criarBeneficiario({ nome: 'Time Teste', tipo: 'Time', regiao: 'Formosa (GO)' })
    assert.equal(time.tipo, 'Time')
    assert.equal(time.regiao, 'Formosa (GO)')
  })

  test('Recusa nome vazio, longo demais ou repetido', async () => {
    for (const nome of [undefined, '', '   ', 'x'.repeat(61)]) {
      const { status } = await criarItem('categorias', nome)
      assert.equal(status, 400)
    }
    const repetido = await criarItem('categorias', 'Bola')
    assert.equal(repetido.status, 400)
    assert.deepEqual(repetido.corpo, { erro: 'Já existe um item com esse nome.' })
  })

  test('Renomear muda o item em todos os registros que o usam', async () => {
    await criarItem('categorias', 'Kit goleiro')
    const doacao = await criarDoacao({ categoria: 'Kit goleiro' })
    const { status, corpo } = await chamar('PUT', `cadastros/categorias/${encodeURIComponent('Kit goleiro')}`, { nome: 'Kit de goleiro' })
    assert.equal(status, 200)
    criados.push(['categorias', 'Kit de goleiro'])
    assert.deepEqual(corpo, { nome: 'Kit de goleiro', uso: 1 })
    const doacoes = (await chamar('GET', 'doacoes')).corpo
    assert.equal(doacoes.find((d) => d.id === doacao.id).categoria, 'Kit de goleiro')
    const repetido = await chamar('PUT', `cadastros/categorias/${encodeURIComponent('Kit de goleiro')}`, { nome: 'Bola' })
    assert.equal(repetido.status, 400)
    const inexistente = await chamar('PUT', 'cadastros/categorias/Nada', { nome: 'Outra' })
    assert.equal(inexistente.status, 404)
  })

  test('Não remove item em uso; remove item livre', async () => {
    await criarItem('categorias', 'Colete')
    const doacao = await criarDoacao({ categoria: 'Colete' })
    const emUso = await chamar('DELETE', 'cadastros/categorias/Colete')
    assert.equal(emUso.status, 400)
    assert.deepEqual(emUso.corpo, { erro: 'Este item está em uso por 1 registro(s). Troque-o nesses registros antes de remover.' })
    assert.equal((await chamar('DELETE', `doacoes/${doacao.id}`)).status, 204)
    assert.equal((await chamar('DELETE', 'cadastros/categorias/Colete')).status, 204)
    assert.ok(!(await chamar('GET', 'cadastros')).corpo.categorias.some((item) => item.nome === 'Colete'))
  })

  test('Lista de cadastro inexistente responde 404', async () => {
    for (const [metodo, rota] of [['POST', 'cadastros/status'], ['PUT', 'cadastros/status/X'], ['DELETE', 'cadastros/status/X']]) {
      const { status, corpo } = await chamar(metodo, rota, { nome: 'X' })
      assert.equal(status, 404)
      assert.deepEqual(corpo, { erro: 'Cadastro não encontrado.' })
    }
  })

  test('Restaurar exemplo recria os itens de exemplo que tenham sido removidos', async () => {
    assert.equal((await chamar('DELETE', 'cadastros/categorias/Troféu')).status, 204)
    await restaurarExemplo()
    assert.ok((await chamar('GET', 'cadastros')).corpo.categorias.some((item) => item.nome === 'Troféu'))
  })
})

describe('Segurança do banco', { skip: !process.env.SUPABASE_ANON_KEY && 'SUPABASE_ANON_KEY não informada' }, () => {
  test('RLS: a chave pública não lê tabelas nem executa funções', async () => {
    await restaurarExemplo()
    const anonimo = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    for (const tabela of ['doacoes', 'beneficiarios', 'entregas', 'categorias_doacao', 'tipos_beneficiario', 'regioes']) {
      const { data, error } = await anonimo.from(tabela).select('*')
      assert.ok(error || data.length === 0, `tabela ${tabela} exposta`)
    }
    for (const funcao of ['apagar_tudo', 'remover_entrega']) {
      const { error } = await anonimo.rpc(funcao, funcao === 'remover_entrega' ? { p_id: 'e1' } : {})
      assert.ok(error, `função ${funcao} exposta`)
    }
    assert.equal((await chamar('GET', 'entregas')).corpo.length, 2)
  })
})

describe('Utilitários e erros', () => {
  test('hojeLocal usa o fuso de Brasília', () => {
    assert.equal(hojeLocal(new Date('2026-10-22T02:30:00Z')), '2026-10-21')
    assert.equal(hojeLocal(new Date('2026-10-22T03:30:00Z')), '2026-10-22')
  })

  test('dataValida aceita só AAAA-MM-DD existente', () => {
    assert.equal(dataValida('2026-02-28'), true)
    for (const valor of ['2026-02-30', '2026-2-1', '', undefined, 20261001]) assert.equal(dataValida(valor), false)
  })

  test('responderErro: 400 para erro de regra e 500 genérico para falha inesperada', () => {
    const respostas = []
    const res = {
      status(codigo) {
        respostas.push(codigo)
        return this
      },
      json(corpo) {
        respostas.push(corpo)
      },
    }
    const consoleErro = console.error
    console.error = () => {}
    responderErro(new ErroDeRegra('regra'), {}, res)
    responderErro(new Error('falha'), {}, res)
    console.error = consoleErro
    assert.deepEqual(respostas, [400, { erro: 'regra' }, 500, { erro: 'Erro interno ao acessar o banco de dados.' }])
  })
})
