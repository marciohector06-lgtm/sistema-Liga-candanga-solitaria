import { createContext, useContext, useEffect, useState } from 'react'

const DataContext = createContext(null)

async function buscar(rota) {
  const resposta = await fetch(`/api/${rota}`)
  return resposta.json()
}

export function DataProvider({ children }) {
  const [dados, setDados] = useState(null)
  const [erroConexao, setErroConexao] = useState(false)

  async function carregar() {
    try {
      const [doacoes, beneficiarios, entregas, resumo] = await Promise.all([
        buscar('doacoes'),
        buscar('beneficiarios'),
        buscar('entregas'),
        buscar('resumo'),
      ])
      setDados({ doacoes, beneficiarios, entregas, resumo })
    } catch {
      setErroConexao(true)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function enviar(metodo, rota, corpo) {
    const resposta = await fetch(`/api/${rota}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    if (!resposta.ok) {
      const { erro } = await resposta.json()
      return erro
    }
    await carregar()
    return null
  }

  if (erroConexao) {
    return <p className="p-6 text-sm text-red-600">Não foi possível conectar ao servidor. Verifique se o backend está rodando.</p>
  }
  if (!dados) {
    return <p className="p-6 text-sm text-slate-500">Carregando...</p>
  }

  const value = {
    ...dados,
    adicionarDoacao: (doacao) => enviar('POST', 'doacoes', doacao),
    atualizarDoacao: (id, doacao) => enviar('PUT', `doacoes/${id}`, doacao),
    removerDoacao: (id) => enviar('DELETE', `doacoes/${id}`),
    adicionarBeneficiario: (beneficiario) => enviar('POST', 'beneficiarios', beneficiario),
    atualizarBeneficiario: (id, beneficiario) => enviar('PUT', `beneficiarios/${id}`, beneficiario),
    removerBeneficiario: (id) => enviar('DELETE', `beneficiarios/${id}`),
    registrarEntrega: (entrega) => enviar('POST', 'entregas', entrega),
    atualizarEntrega: (id, entrega) => enviar('PUT', `entregas/${id}`, entrega),
    removerEntrega: (id) => enviar('DELETE', `entregas/${id}`),
    resetarDadosExemplo: () => enviar('POST', 'sistema/restaurar-exemplo'),
    apagarTodosOsDados: () => enviar('POST', 'sistema/apagar-tudo'),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
