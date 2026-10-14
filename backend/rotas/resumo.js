import { Router } from 'express'
import { lerDados } from '../banco.js'

const CATEGORIAS_DOACAO = ['Cesta básica', 'Bola', 'Rede', 'Troféu', 'Uniforme']

const router = Router()

router.get('/', (req, res) => {
  const { doacoes, beneficiarios, entregas } = lerDados()

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

export default router
