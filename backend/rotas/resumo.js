import { Router } from 'express'
import { listarBeneficiarios, listarDoacoes, listarEntregas } from '../banco.js'
import { CATEGORIAS_DOACAO } from '../constantes.js'
import { responderErro } from '../erros.js'

const router = Router()

router.get('/', async (req, res) => {
  const [doacoes, beneficiarios, entregas] = await Promise.all([listarDoacoes(), listarBeneficiarios(), listarEntregas()])

  const doacoesPorCategoria = {}
  for (const categoria of CATEGORIAS_DOACAO) {
    doacoesPorCategoria[categoria] = doacoes.filter((d) => d.categoria === categoria).length
  }

  const beneficiariosPorRegiao = {}
  for (const beneficiario of beneficiarios) {
    beneficiariosPorRegiao[beneficiario.regiao] = (beneficiariosPorRegiao[beneficiario.regiao] ?? 0) + 1
  }

  res.json({
    totalDoacoes: doacoes.length,
    doacoesDisponiveis: doacoes.filter((d) => d.status === 'Disponível').length,
    totalBeneficiarios: beneficiarios.length,
    totalEntregas: entregas.length,
    doacoesPorCategoria,
    beneficiariosPorRegiao,
  })
})

router.use(responderErro)

export default router
