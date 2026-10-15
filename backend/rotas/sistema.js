import { Router } from 'express'
import { dadosExemplo, salvarDados } from '../banco.js'

const router = Router()

router.post('/restaurar-exemplo', (req, res) => {
  salvarDados(dadosExemplo())
  res.status(204).end()
})

router.post('/apagar-tudo', (req, res) => {
  salvarDados({ doacoes: [], beneficiarios: [], entregas: [] })
  res.status(204).end()
})

export default router
