import { useEffect, useId, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  aberto: boolean
  onFechar: () => void
  children: ReactNode
}

export function Modal({ titulo, aberto, onFechar, children }: ModalProps) {
  const tituloId = useId()

  useEffect(() => {
    if (!aberto) return
    const fecharComEsc = (evento: KeyboardEvent) => evento.key === 'Escape' && onFechar()
    window.addEventListener('keydown', fecharComEsc)
    return () => window.removeEventListener('keydown', fecharComEsc)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id={tituloId} className="text-base font-semibold text-slate-900">
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-md px-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface ConfirmarRemocaoProps {
  aberto: boolean
  descricao: string
  aviso?: string
  erro: string
  onConfirmar: () => void
  onFechar: () => void
}

export function ConfirmarRemocao({ aberto, descricao, aviso, erro, onConfirmar, onFechar }: ConfirmarRemocaoProps) {
  return (
    <Modal titulo="Confirmar remoção" aberto={aberto} onFechar={onFechar}>
      <p className="text-sm text-slate-600">
        Tem certeza que deseja remover <strong className="text-slate-900">{descricao}</strong>? Essa ação não pode ser
        desfeita.
      </p>
      {aviso && !erro && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{aviso}</p>}
      {erro && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onFechar} className={botaoSecundario}>
          Cancelar
        </button>
        {!erro && (
          <button type="button" onClick={onConfirmar} className={botaoPerigo}>
            Remover
          </button>
        )}
      </div>
    </Modal>
  )
}

export const botaoPrimario =
  'rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700'
export const botaoSecundario =
  'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
export const botaoPerigo = 'rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
