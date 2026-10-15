import fs from 'node:fs'
import path from 'node:path'
import { SEED_BENEFICIARIOS, SEED_DOACOES, SEED_ENTREGAS } from './seed.js'

const ARQUIVO_DADOS = path.join(import.meta.dirname, 'dados.json')

export function dadosExemplo() {
  return structuredClone({ doacoes: SEED_DOACOES, beneficiarios: SEED_BENEFICIARIOS, entregas: SEED_ENTREGAS })
}

export function lerDados() {
  if (!fs.existsSync(ARQUIVO_DADOS)) return dadosExemplo()
  return JSON.parse(fs.readFileSync(ARQUIVO_DADOS, 'utf-8'))
}

export function salvarDados(dados) {
  fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(dados, null, 2))
}
