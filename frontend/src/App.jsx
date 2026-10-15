import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DataProvider } from './lib/DataContext'
import { Beneficiarios } from './pages/Beneficiarios'
import { Configuracoes } from './pages/configuracoes/Configuracoes'
import { Dashboard } from './pages/Dashboard'
import { Doacoes } from './pages/Doacoes'
import { Entregas } from './pages/Entregas'

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="doacoes" element={<Doacoes />} />
            <Route path="beneficiarios" element={<Beneficiarios />} />
            <Route path="entregas" element={<Entregas />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
