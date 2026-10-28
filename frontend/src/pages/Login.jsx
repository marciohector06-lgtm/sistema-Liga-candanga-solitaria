import { useState } from 'react'
import { Field, inputClass } from '../components/Field'
import logo from '../assets/logo-lcf.png'
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
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <section className="relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-6 py-10 text-center text-white lg:w-1/2 lg:py-16">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-3 bg-yellow-400 lg:block" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-yellow-400 lg:hidden" />
        <img
          src={logo}
          alt="Escudo da Liga Candanga de Futsal"
          className="h-36 w-auto drop-shadow-xl sm:h-44 lg:h-64"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-300">Liga Candanga de Futsal</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Liga Candanga Solidária</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-emerald-50 sm:text-base">
            Doações, beneficiários e entregas das ações solidárias da Liga em um só lugar.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Entrar</h2>
            <p className="mt-1 text-sm text-slate-500">Use o e-mail e a senha da equipe.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
          <p className="mt-8 text-xs text-slate-400">Não tem acesso? Fale com o responsável técnico do sistema.</p>
        </div>
      </section>
    </div>
  )
}
