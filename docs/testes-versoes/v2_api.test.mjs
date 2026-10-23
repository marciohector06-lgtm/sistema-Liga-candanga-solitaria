import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const PASTA_BACKEND = process.env.V2_BACKEND
const PORTA = 3310
const BASE = `http://127.0.0.1:${PORTA}/api`
const ARQUIVO_DADOS = path.join(PASTA_BACKEND, 'dados.json')

let servidor

function iniciarServidor() {
  return new Promise((resolve, reject) => {
    const processo = spawn(process.execPath, ['server.js'], { cwd: PASTA_BACKEND, env: { ...process.env, PORT: String(PORTA) } })
    processo.stdout.on('data', (trecho) => {
      if (trecho.toString().includes('Servidor rodando')) resolve(processo)
    })
    processo.on('error', reject)
  })
}

function pararServidor(processo) {
  return new Promise((resolve) => {
    processo.on('exit', resolve)
    processo.kill()
  })
}

async function chamar(metodo, rota, corpo) {
  const resposta = await fetch(`${BASE}${rota}`, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : {},
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const texto = await resposta.text()
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null }
}

const doacaoValida = { categoria: 'Bola', quantidade: 10, origem: '  Loja Teste  ', data: '2026-10-01' }
const beneficiarioValido = { nome: '  Escolinha Teste  ', tipo: 'Escolinha', regiao: 'Guará', contato: '(61) 90000-0000', necessidade: 'Bolas' }

before(async () => {
  fs.rmSync(ARQUIVO_DADOS, { force: true })
  servidor = await iniciarServidor()
})

after(async () => {
  await pararServidor(servidor)
  fs.rmSync(ARQUIVO_DADOS, { force: true })
})

beforeEach(async () => {
  await chamar('POST', '/sistema/restaurar-exemplo')
})

describe('Doações', () => {
  test('TV2-01 cadastra doação válida com status Disponível e origem sem espaços nas pontas', async () => {
    const { status, corpo } = await chamar('POST', '/doacoes', doacaoValida)
    assert.equal(status, 201)
    assert.equal(corpo.status, 'Disponível')
    assert.equal(corpo.origem, 'Loja Teste')
    assert.match(corpo.id, /^doacao-/)
  })

  test('TV2-02 recusa doação com origem só com espaços', async () => {
    const { status, corpo } = await chamar('POST', '/doacoes', { ...doacaoValida, origem: '   ' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Preencha a origem e uma quantidade inteira maior que zero.')
  })

  test('TV2-03 recusa quantidade zero, negativa, fracionária ou em texto', async () => {
    for (const quantidade of [0, -1, 2.5, '3']) {
      const { status } = await chamar('POST', '/doacoes', { ...doacaoValida, quantidade })
      assert.equal(status, 400, `quantidade ${JSON.stringify(quantidade)}`)
    }
  })

  test('TV2-04 responde 404 ao editar doação inexistente', async () => {
    const { status } = await chamar('PUT', '/doacoes/nao-existe', { ...doacaoValida, status: 'Disponível' })
    assert.equal(status, 404)
  })

  test('TV2-05 não marca como Entregue uma doação sem entrega', async () => {
    const { status, corpo } = await chamar('PUT', '/doacoes/d2', { categoria: 'Cesta básica', quantidade: 25, origem: 'Torcida Ceilândia', data: '2026-09-12', status: 'Entregue' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Para marcar como Entregue, registre uma entrega na tela de Entregas.')
  })

  test('TV2-06 não muda o status de uma doação que já tem entrega', async () => {
    const { status, corpo } = await chamar('PUT', '/doacoes/d1', { categoria: 'Cesta básica', quantidade: 40, origem: 'Equipe Guará FS', data: '2026-09-05', status: 'Disponível' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Esta doação já tem uma entrega registrada. Remova a entrega para mudar o status.')
  })

  test('TV2-07 não aceita data de recebimento posterior à entrega', async () => {
    const { status, corpo } = await chamar('PUT', '/doacoes/d1', { categoria: 'Cesta básica', quantidade: 40, origem: 'Equipe Guará FS', data: '2026-09-30', status: 'Entregue' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'A data de recebimento não pode ser posterior à entrega (2026-09-07).')
  })

  test('TV2-08 permite marcar uma doação disponível como Reservada', async () => {
    const { status, corpo } = await chamar('PUT', '/doacoes/d2', { categoria: 'Cesta básica', quantidade: 25, origem: 'Torcida Ceilândia', data: '2026-09-12', status: 'Reservada' })
    assert.equal(status, 200)
    assert.equal(corpo.status, 'Reservada')
  })

  test('TV2-09 não remove doação que já foi entregue', async () => {
    const { status, corpo } = await chamar('DELETE', '/doacoes/d1')
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.')
  })

  test('TV2-10 remove doação sem entrega', async () => {
    const { status } = await chamar('DELETE', '/doacoes/d2')
    assert.equal(status, 204)
    const { corpo } = await chamar('GET', '/doacoes')
    assert.equal(corpo.some((d) => d.id === 'd2'), false)
  })
})

describe('Beneficiários', () => {
  test('TV2-11 recusa beneficiário sem nome', async () => {
    const { status, corpo } = await chamar('POST', '/beneficiarios', { ...beneficiarioValido, nome: '  ' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'O nome é obrigatório.')
  })

  test('TV2-12 cadastra beneficiário válido com a data de hoje', async () => {
    const { status, corpo } = await chamar('POST', '/beneficiarios', beneficiarioValido)
    assert.equal(status, 201)
    assert.equal(corpo.nome, 'Escolinha Teste')
    assert.match(corpo.dataCadastro, /^\d{4}-\d{2}-\d{2}$/)
  })

  test('TV2-13 responde 404 ao editar beneficiário inexistente', async () => {
    const { status } = await chamar('PUT', '/beneficiarios/nao-existe', beneficiarioValido)
    assert.equal(status, 404)
  })

  test('TV2-14 não remove beneficiário com entregas e informa a quantidade', async () => {
    const { status, corpo } = await chamar('DELETE', '/beneficiarios/b2')
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Este beneficiário tem 1 entrega(s) registrada(s). Remova as entregas antes.')
  })

  test('TV2-15 remove beneficiário sem entregas', async () => {
    const { status } = await chamar('DELETE', '/beneficiarios/b3')
    assert.equal(status, 204)
  })
})

describe('Entregas', () => {
  test('TV2-16 recusa entrega sem responsável', async () => {
    const { status, corpo } = await chamar('POST', '/entregas', { doacaoId: 'd2', beneficiarioId: 'b2', data: '2026-10-01', responsavel: ' ' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Selecione a doação, o beneficiário e informe o responsável.')
  })

  test('TV2-17 recusa entrega de doação Reservada', async () => {
    const { status, corpo } = await chamar('POST', '/entregas', { doacaoId: 'd5', beneficiarioId: 'b3', data: '2026-10-01', responsavel: 'Equipe' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Esta doação não está disponível para entrega.')
  })

  test('TV2-18 recusa segunda entrega da mesma doação', async () => {
    const { status } = await chamar('POST', '/entregas', { doacaoId: 'd1', beneficiarioId: 'b1', data: '2026-10-01', responsavel: 'Equipe' })
    assert.equal(status, 400)
  })

  test('TV2-19 recusa entrega com data anterior ao recebimento', async () => {
    const { status, corpo } = await chamar('POST', '/entregas', { doacaoId: 'd2', beneficiarioId: 'b2', data: '2026-09-01', responsavel: 'Equipe' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'A data da entrega não pode ser anterior ao recebimento da doação (2026-09-12).')
  })

  test('TV2-20 registra entrega válida e marca a doação como Entregue', async () => {
    const { status } = await chamar('POST', '/entregas', { doacaoId: 'd2', beneficiarioId: 'b2', data: '2026-10-01', responsavel: ' Equipe ' })
    assert.equal(status, 201)
    const { corpo } = await chamar('GET', '/doacoes')
    assert.equal(corpo.find((d) => d.id === 'd2').status, 'Entregue')
  })

  test('TV2-21 não aceita editar entrega para data anterior ao recebimento', async () => {
    const { status } = await chamar('PUT', '/entregas/e1', { beneficiarioId: 'b2', data: '2026-09-01', responsavel: 'Equipe' })
    assert.equal(status, 400)
  })

  test('TV2-22 não aceita editar entrega sem responsável', async () => {
    const { status, corpo } = await chamar('PUT', '/entregas/e1', { beneficiarioId: 'b2', data: '2026-09-07', responsavel: '' })
    assert.equal(status, 400)
    assert.equal(corpo.erro, 'Informe o responsável pela entrega.')
  })

  test('TV2-23 remover a entrega devolve a doação para Disponível', async () => {
    const { status } = await chamar('DELETE', '/entregas/e1')
    assert.equal(status, 204)
    const { corpo } = await chamar('GET', '/doacoes')
    assert.equal(corpo.find((d) => d.id === 'd1').status, 'Disponível')
  })
})

describe('Resumo, sistema e persistência', () => {
  test('TV2-24 resumo confere com os dados de exemplo', async () => {
    const { corpo } = await chamar('GET', '/resumo')
    assert.deepEqual(
      { ...corpo, doacoesPorCategoria: undefined, beneficiariosPorRegiao: undefined },
      { totalDoacoes: 6, doacoesDisponiveis: 3, totalBeneficiarios: 3, totalEntregas: 2, doacoesPorCategoria: undefined, beneficiariosPorRegiao: undefined },
    )
    assert.deepEqual(corpo.doacoesPorCategoria, { 'Cesta básica': 2, Bola: 1, Rede: 1, Troféu: 1, Uniforme: 1 })
    assert.deepEqual(corpo.beneficiariosPorRegiao, { Guará: 1, Ceilândia: 1, Samambaia: 1 })
  })

  test('TV2-25 apagar tudo zera os dados e restaurar exemplo os traz de volta', async () => {
    await chamar('POST', '/sistema/apagar-tudo')
    let { corpo } = await chamar('GET', '/resumo')
    assert.equal(corpo.totalDoacoes + corpo.totalBeneficiarios + corpo.totalEntregas, 0)
    await chamar('POST', '/sistema/restaurar-exemplo')
    ;({ corpo } = await chamar('GET', '/resumo'))
    assert.equal(corpo.totalDoacoes, 6)
  })

  test('TV2-26 os dados continuam depois de reiniciar o servidor', async () => {
    await chamar('POST', '/beneficiarios', beneficiarioValido)
    await pararServidor(servidor)
    servidor = await iniciarServidor()
    const { corpo } = await chamar('GET', '/beneficiarios')
    assert.equal(corpo.length, 4)
  })
})

describe('Lacunas conhecidas da v2 (comportamento observado)', () => {
  test('TV2-27 aceita categoria fora da lista', async () => {
    const { status } = await chamar('POST', '/doacoes', { ...doacaoValida, categoria: 'Geladeira' })
    assert.equal(status, 201)
  })

  test('TV2-28 aceita doação sem data', async () => {
    const { status } = await chamar('POST', '/doacoes', { ...doacaoValida, data: undefined })
    assert.equal(status, 201)
  })

  test('TV2-29 aceita entrega para beneficiário inexistente', async () => {
    const { status } = await chamar('POST', '/entregas', { doacaoId: 'd2', beneficiarioId: 'nao-existe', data: '2026-10-01', responsavel: 'Equipe' })
    assert.equal(status, 201)
  })

  test('TV2-30 aceita tipo e região fora da lista no beneficiário', async () => {
    const { status } = await chamar('POST', '/beneficiarios', { ...beneficiarioValido, tipo: 'Empresa', regiao: 'Goiânia' })
    assert.equal(status, 201)
  })
})
