export class ErroDeRegra extends Error {}

export function responderErro(erro, req, res, next) {
  if (erro instanceof ErroDeRegra) return res.status(400).json({ erro: erro.message })
  console.error(erro)
  res.status(500).json({ erro: 'Erro interno ao acessar o banco de dados.' })
}
