import { Router } from 'express'
import {
  contarUsoDoItemCadastro,
  criarItemCadastro,
  listarCadastros,
  listaDeCadastroExiste,
  removerItemCadastro,
  renomearItemCadastro,
} from '../banco.js'
import { responderErro } from '../erros.js'

const TAMANHO_MAXIMO_NOME = 60

const router = Router()

function validarNome(nome) {
  if (typeof nome !== 'string' || !nome.trim()) return 'Informe um nome.'
  if (nome.trim().length > TAMANHO_MAXIMO_NOME) return `O nome pode ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`
  return null
}

router.param('lista', (req, res, next, lista) => {
  if (!listaDeCadastroExiste(lista)) return res.status(404).json({ erro: 'Cadastro não encontrado.' })
  next()
})

router.get('/', async (req, res) => {
  res.json(await listarCadastros())
})

router.post('/:lista', async (req, res) => {
  const erro = validarNome(req.body?.nome)
  if (erro) return res.status(400).json({ erro })

  res.status(201).json(await criarItemCadastro(req.params.lista, req.body.nome.trim()))
})

router.put('/:lista/:nome', async (req, res) => {
  const erro = validarNome(req.body?.nome)
  if (erro) return res.status(400).json({ erro })

  const item = await renomearItemCadastro(req.params.lista, req.params.nome, req.body.nome.trim())
  if (!item) return res.status(404).json({ erro: 'Item não encontrado.' })
  res.json(item)
})

router.delete('/:lista/:nome', async (req, res) => {
  const { lista, nome } = req.params
  const uso = await contarUsoDoItemCadastro(lista, nome)
  if (uso > 0) {
    return res.status(400).json({ erro: `Este item está em uso por ${uso} registro(s). Troque-o nesses registros antes de remover.` })
  }

  await removerItemCadastro(lista, nome)
  res.status(204).end()
})

router.use(responderErro)

export default router
