import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DataProvider } from './lib/DataContext'
import { supabase, supabaseConfigurado } from './lib/supabase'
import { Beneficiarios } from './pages/Beneficiarios'
import { Cadastros } from './pages/cadastros/Cadastros'
import { Configuracoes } from './pages/configuracoes/Configuracoes'
import { Dashboard } from './pages/Dashboard'
import { Doacoes } from './pages/Doacoes'
import { Entregas } from './pages/Entregas'
import { Login } from './pages/Login'

export default function App() {
  if (!supabaseConfigurado) {
    return (
      <p className="p-6 text-sm text-red-600">
        Configuração ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
      </p>
    )
  }
  return <AppAutenticado />
}

function AppAutenticado() {
  const [sessao, setSessao] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => setSessao(novaSessao))
    return () => data.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) {
    return <p className="p-6 text-sm text-slate-500">Carregando...</p>
  }
  if (!sessao) {
    return <Login />
  }

  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="doacoes" element={<Doacoes />} />
            <Route path="beneficiarios" element={<Beneficiarios />} />
            <Route path="entregas" element={<Entregas />} />
            <Route path="cadastros" element={<Cadastros />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
