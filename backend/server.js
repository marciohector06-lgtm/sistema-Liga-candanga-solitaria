import fs from 'node:fs'

const ARQUIVO_AMBIENTE = new URL('.env', import.meta.url)
if (fs.existsSync(ARQUIVO_AMBIENTE)) process.loadEnvFile(ARQUIVO_AMBIENTE)

const { default: app } = await import('./app.js')

const PORTA = process.env.PORT || 3000

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`)
})
