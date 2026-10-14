import { Router } from 'express'
import { lerDados, salvarDados } from '../banco.js'
import { gerarId } from '../util.js'

const router = Router()

function validarDoacao(doacao) {
  if (!doacao.origem?.trim() || !Number.isInteger(doacao.quantidade) || doacao.quantidade <= 0) {
    return 'Preencha a origem e uma quantidade inteira maior que zero.'
  }
  return null
}

router.get('/', (req, res) => {
  res.json(lerDados().doacoes)
})

router.post('/', (req, res) => {
  const erro = validarDoacao(req.body)
  if (erro) return res.status(400).json({ erro })

  const { categoria, quantidade, origem, data } = req.body
  const dados = lerDados()
  const doacao = { id: gerarId('doacao'), categoria, quantidade, origem: origem.trim(), data, status: 'Disponível' }
  dados.doacoes.unshift(doacao)
  salvarDados(dados)
  res.status(201).json(doacao)
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const dados = lerDados()
  const doacao = dados.doacoes.find((d) => d.id === id)
  if (!doacao) return res.status(404).json({ erro: 'Doação não encontrada.' })

  const erro = validarDoacao(req.body)
  if (erro) return res.status(400).json({ erro })

  const { categoria, quantidade, origem, data, status } = req.body
  const entrega = dados.entregas.find((e) => e.doacaoId === id)
  if (entrega && status !== 'Entregue') {
    return res.status(400).json({ erro: 'Esta doação já tem uma entrega registrada. Remova a entrega para mudar o status.' })
  }
  if (!entrega && status === 'Entregue') {
    return res.status(400).json({ erro: 'Para marcar como Entregue, registre uma entrega na tela de Entregas.' })
  }
  if (entrega && data > entrega.data) {
    return res.status(400).json({ erro: `A data de recebimento não pode ser posterior à entrega (${entrega.data}).` })
  }

  Object.assign(doacao, { categoria, quantidade, origem: origem.trim(), data, status })
  salvarDados(dados)
  res.json(doacao)
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const dados = lerDados()
  if (dados.entregas.some((e) => e.doacaoId === id)) {
    return res.status(400).json({ erro: 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.' })
  }

  dados.doacoes = dados.doacoes.filter((d) => d.id !== id)
  salvarDados(dados)
  res.status(204).end()
})

export default router
