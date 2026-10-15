import { Router } from 'express'
import { lerDados, salvarDados } from '../banco.js'
import { gerarId } from '../util.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(lerDados().entregas)
})

router.post('/', (req, res) => {
  const { doacaoId, beneficiarioId, data, responsavel } = req.body
  if (!doacaoId || !beneficiarioId || !responsavel?.trim()) {
    return res.status(400).json({ erro: 'Selecione a doação, o beneficiário e informe o responsável.' })
  }

  const dados = lerDados()
  const doacao = dados.doacoes.find((d) => d.id === doacaoId)
  if (!doacao || doacao.status !== 'Disponível') {
    return res.status(400).json({ erro: 'Esta doação não está disponível para entrega.' })
  }
  if (data < doacao.data) {
    return res.status(400).json({ erro: `A data da entrega não pode ser anterior ao recebimento da doação (${doacao.data}).` })
  }

  const entrega = { id: gerarId('entrega'), doacaoId, beneficiarioId, data, responsavel: responsavel.trim() }
  dados.entregas.unshift(entrega)
  doacao.status = 'Entregue'
  salvarDados(dados)
  res.status(201).json(entrega)
})

router.put('/:id', (req, res) => {
  const dados = lerDados()
  const entrega = dados.entregas.find((e) => e.id === req.params.id)
  if (!entrega) return res.status(404).json({ erro: 'Entrega não encontrada.' })

  const { beneficiarioId, data, responsavel } = req.body
  if (!responsavel?.trim()) return res.status(400).json({ erro: 'Informe o responsável pela entrega.' })

  const doacao = dados.doacoes.find((d) => d.id === entrega.doacaoId)
  if (doacao && data < doacao.data) {
    return res.status(400).json({ erro: `A data da entrega não pode ser anterior ao recebimento da doação (${doacao.data}).` })
  }

  Object.assign(entrega, { beneficiarioId, data, responsavel: responsavel.trim() })
  salvarDados(dados)
  res.json(entrega)
})

router.delete('/:id', (req, res) => {
  const dados = lerDados()
  const entrega = dados.entregas.find((e) => e.id === req.params.id)
  if (!entrega) return res.status(404).json({ erro: 'Entrega não encontrada.' })

  dados.entregas = dados.entregas.filter((e) => e.id !== entrega.id)
  const doacao = dados.doacoes.find((d) => d.id === entrega.doacaoId)
  if (doacao) doacao.status = 'Disponível'
  salvarDados(dados)
  res.status(204).end()
})

export default router
