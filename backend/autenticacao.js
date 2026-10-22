import { supabase } from './supabase.js'

const ERRO_SESSAO = 'Sessão expirada ou inválida. Entre novamente.'
const ERRO_VALIDACAO = 'Não foi possível validar a sessão agora. Tente novamente em instantes.'

function tokenRecusado(erro) {
  return erro.status >= 400 && erro.status < 500
}

export async function exigirAutenticacao(req, res, next) {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ')
  if (esquema !== 'Bearer' || !token) return res.status(401).json({ erro: ERRO_SESSAO })

  const { data, error } = await supabase.auth.getUser(token)
  if (error && !tokenRecusado(error)) {
    console.error('Falha ao validar sessão no Supabase:', error.message)
    return res.status(503).json({ erro: ERRO_VALIDACAO })
  }
  if (error || !data?.user) return res.status(401).json({ erro: ERRO_SESSAO })

  req.usuario = data.user
  next()
}
