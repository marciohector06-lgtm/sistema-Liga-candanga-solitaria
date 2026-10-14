import { Router } from 'express'
import { lerDados, salvarDados } from '../banco.js'
import { gerarId, hojeLocal } from '../util.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(lerDados().beneficiarios)
})

router.post('/', (req, res) => {
  const { nome, tipo, regiao, contato, necessidade } = req.body
  if (!nome?.trim()) return res.status(400).json({ erro: 'O nome é obrigatório.' })

  const dados = lerDados()
  const beneficiario = { id: gerarId('beneficiario'), nome: nome.trim(), tipo, regiao, contato, necessidade, dataCadastro: hojeLocal() }
  dados.beneficiarios.unshift(beneficiario)
  salvarDados(dados)
  res.status(201).json(beneficiario)
})

router.put('/:id', (req, res) => {
  const dados = lerDados()
  const beneficiario = dados.beneficiarios.find((b) => b.id === req.params.id)
  if (!beneficiario) return res.status(404).json({ erro: 'Beneficiário não encontrado.' })

  const { nome, tipo, regiao, contato, necessidade } = req.body
  if (!nome?.trim()) return res.status(400).json({ erro: 'O nome é obrigatório.' })

  Object.assign(beneficiario, { nome: nome.trim(), tipo, regiao, contato, necessidade })
  salvarDados(dados)
  res.json(beneficiario)
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const dados = lerDados()
  const quantidade = dados.entregas.filter((e) => e.beneficiarioId === id).length
  if (quantidade > 0) {
    return res.status(400).json({ erro: `Este beneficiário tem ${quantidade} entrega(s) registrada(s). Remova as entregas antes.` })
  }

  dados.beneficiarios = dados.beneficiarios.filter((b) => b.id !== id)
  salvarDados(dados)
  res.status(204).end()
})

export default router
