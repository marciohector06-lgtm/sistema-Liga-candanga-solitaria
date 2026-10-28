import { NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo-lcf.png'
import { supabase } from '../lib/supabase'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/doacoes', label: 'Doações' },
  { to: '/beneficiarios', label: 'Beneficiários' },
  { to: '/entregas', label: 'Entregas' },
  { to: '/cadastros', label: 'Cadastros' },
  { to: '/configuracoes', label: 'Configurações' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Escudo da Liga Candanga de Futsal" className="h-12 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Liga Candanga de Futsal
              </p>
              <h1 className="text-lg font-semibold text-slate-900">Liga Candanga Solidária</h1>
            </div>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto whitespace-nowrap px-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}
