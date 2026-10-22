import { Router } from 'express'
import {
  atualizarBeneficiario,
  buscarBeneficiario,
  contarEntregasDoBeneficiario,
  criarBeneficiario,
  listarBeneficiarios,
  removerBeneficiario,
} from '../banco.js'
import { REGIOES_ADMINISTRATIVAS_DF, TIPOS_BENEFICIARIO } from '../constantes.js'
import { responderErro } from '../erros.js'
import { gerarId, hojeLocal } from '../util.js'

const router = Router()

function validarBeneficiario({ nome, tipo, regiao }) {
  if (!nome?.trim()) return 'O nome é obrigatório.'
  if (!TIPOS_BENEFICIARIO.includes(tipo) || !REGIOES_ADMINISTRATIVAS_DF.includes(regiao)) {
    return 'Selecione um tipo e uma região administrativa válidos.'
  }
  return null
}

router.get('/', async (req, res) => {
  res.json(await listarBeneficiarios())
})

router.post('/', async (req, res) => {
  const erro = validarBeneficiario(req.body)
  if (erro) return res.status(400).json({ erro })

  const { nome, tipo, regiao, contato, necessidade } = req.body
  const beneficiario = await criarBeneficiario({
    id: gerarId('beneficiario'),
    nome: nome.trim(),
    tipo,
    regiao,
    contato: contato ?? '',
    necessidade: necessidade ?? '',
    dataCadastro: hojeLocal(),
  })
  res.status(201).json(beneficiario)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  if (!(await buscarBeneficiario(id))) return res.status(404).json({ erro: 'Beneficiário não encontrado.' })

  const erro = validarBeneficiario(req.body)
  if (erro) return res.status(400).json({ erro })

  const { nome, tipo, regiao, contato, necessidade } = req.body
  const beneficiario = await atualizarBeneficiario(id, {
    nome: nome.trim(),
    tipo,
    regiao,
    contato: contato ?? '',
    necessidade: necessidade ?? '',
  })
  res.json(beneficiario)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const quantidade = await contarEntregasDoBeneficiario(id)
  if (quantidade > 0) {
    return res.status(400).json({ erro: `Este beneficiário tem ${quantidade} entrega(s) registrada(s). Remova as entregas antes.` })
  }

  await removerBeneficiario(id)
  res.status(204).end()
})

router.use(responderErro)

export default router
