import express from 'express'
import path from 'node:path'
import beneficiarios from './rotas/beneficiarios.js'
import doacoes from './rotas/doacoes.js'
import entregas from './rotas/entregas.js'
import resumo from './rotas/resumo.js'
import sistema from './rotas/sistema.js'

const app = express()
const PORTA = process.env.PORT || 3000

app.use(express.json())

app.use('/api/doacoes', doacoes)
app.use('/api/beneficiarios', beneficiarios)
app.use('/api/entregas', entregas)
app.use('/api/resumo', resumo)
app.use('/api/sistema', sistema)

app.use(express.static(path.join(import.meta.dirname, '..', 'frontend', 'dist')))

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`)
})
