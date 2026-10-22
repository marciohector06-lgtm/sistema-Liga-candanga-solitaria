import { Router } from 'express'
import { apagarTudo, restaurarExemplo } from '../banco.js'
import { responderErro } from '../erros.js'

const router = Router()

router.post('/restaurar-exemplo', async (req, res) => {
  await restaurarExemplo()
  res.status(204).end()
})

router.post('/apagar-tudo', async (req, res) => {
  await apagarTudo()
  res.status(204).end()
})

router.use(responderErro)

export default router
