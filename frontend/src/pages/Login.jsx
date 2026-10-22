import { useState } from 'react'
import { Field, inputClass } from '../components/Field'
import { botaoPrimario } from '../components/Modal'
import { supabase } from '../lib/supabase'

const MENSAGENS_ERRO = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Este e-mail ainda não foi confirmado.',
  user_banned: 'Este acesso está bloqueado. Fale com a coordenação da Liga.',
  over_request_rate_limit: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
}

const ERRO_PADRAO = 'Não foi possível entrar. Verifique a conexão e tente novamente.'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(evento) {
    evento.preventDefault()
    setEntrando(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEntrando(false)
    if (error) setErro(MENSAGENS_ERRO[error.code] ?? ERRO_PADRAO)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Liga Candanga de Futsal</p>
          <h1 className="text-xl font-semibold text-slate-900">Liga Candanga Solidária</h1>
          <p className="mt-1 text-sm text-slate-500">Entre com o e-mail e a senha da equipe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Field label="E-mail">
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
          </Field>
          {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
          <button
            type="submit"
            disabled={entrando}
            className={`${botaoPrimario} w-full disabled:cursor-not-allowed disabled:bg-slate-300`}
          >
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
