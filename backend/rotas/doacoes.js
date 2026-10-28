import { Router } from 'express'
import { atualizarDoacao, buscarDoacao, criarDoacao, doacaoTemEntrega, listarDoacoes, removerDoacao } from '../banco.js'
import { responderErro } from '../erros.js'
import { dataValida, gerarId } from '../util.js'

const router = Router()

function validarDoacao(doacao) {
  if (!doacao.origem?.trim() || !Number.isInteger(doacao.quantidade) || doacao.quantidade <= 0) {
    return 'Preencha a origem e uma quantidade inteira maior que zero.'
  }
  if (typeof doacao.categoria !== 'string' || !doacao.categoria) return 'Selecione uma categoria válida.'
  if (!dataValida(doacao.data)) return 'Informe uma data de recebimento válida.'
  return null
}

router.get('/', async (req, res) => {
  res.json(await listarDoacoes())
})

router.post('/', async (req, res) => {
  const erro = validarDoacao(req.body)
  if (erro) return res.status(400).json({ erro })

  const { categoria, quantidade, origem, data } = req.body
  const doacao = await criarDoacao({ id: gerarId('doacao'), categoria, quantidade, origem: origem.trim(), data, status: 'Disponível' })
  res.status(201).json(doacao)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  if (!(await buscarDoacao(id))) return res.status(404).json({ erro: 'Doação não encontrada.' })

  const erro = validarDoacao(req.body)
  if (erro) return res.status(400).json({ erro })

  const { categoria, quantidade, origem, data, status } = req.body
  const doacao = await atualizarDoacao(id, { categoria, quantidade, origem: origem.trim(), data, status })
  res.json(doacao)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (await doacaoTemEntrega(id)) {
    return res.status(400).json({ erro: 'Esta doação já foi entregue. Remova a entrega antes de remover a doação.' })
  }

  await removerDoacao(id)
  res.status(204).end()
})

router.use(responderErro)

export default router
