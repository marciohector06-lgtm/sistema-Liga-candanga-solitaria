import { Router } from 'express'
import { atualizarEntrega, buscarEntrega, listarEntregas, registrarEntrega, removerEntrega } from '../banco.js'
import { responderErro } from '../erros.js'
import { dataValida, gerarId } from '../util.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await listarEntregas())
})

router.post('/', async (req, res) => {
  const { doacaoId, beneficiarioId, data, responsavel } = req.body
  if (!doacaoId || !beneficiarioId || !responsavel?.trim()) {
    return res.status(400).json({ erro: 'Selecione a doação, o beneficiário e informe o responsável.' })
  }
  if (!dataValida(data)) return res.status(400).json({ erro: 'Informe uma data de entrega válida.' })

  const entrega = await registrarEntrega({ id: gerarId('entrega'), doacaoId, beneficiarioId, data, responsavel: responsavel.trim() })
  res.status(201).json(entrega)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  if (!(await buscarEntrega(id))) return res.status(404).json({ erro: 'Entrega não encontrada.' })

  const { beneficiarioId, data, responsavel } = req.body
  if (!responsavel?.trim()) return res.status(400).json({ erro: 'Informe o responsável pela entrega.' })
  if (!beneficiarioId) return res.status(400).json({ erro: 'Beneficiário não encontrado.' })
  if (!dataValida(data)) return res.status(400).json({ erro: 'Informe uma data de entrega válida.' })

  const entrega = await atualizarEntrega(id, { beneficiarioId, data, responsavel: responsavel.trim() })
  res.json(entrega)
})

router.delete('/:id', async (req, res) => {
  if (!(await removerEntrega(req.params.id))) return res.status(404).json({ erro: 'Entrega não encontrada.' })
  res.status(204).end()
})

router.use(responderErro)

export default router
