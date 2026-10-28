import { Router } from 'express'
import { listarBeneficiarios, listarDoacoes, listarEntregas, listarNomesDoCadastro } from '../banco.js'
import { responderErro } from '../erros.js'

const router = Router()

router.get('/', async (req, res) => {
  const [doacoes, beneficiarios, entregas, categorias] = await Promise.all([
    listarDoacoes(),
    listarBeneficiarios(),
    listarEntregas(),
    listarNomesDoCadastro('categorias'),
  ])

  const doacoesPorCategoria = {}
  for (const categoria of categorias) {
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
