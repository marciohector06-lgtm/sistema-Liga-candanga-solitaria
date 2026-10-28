import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const DataContext = createContext(null)

async function requisitar(metodo, rota, corpo) {
  const { data } = await supabase.auth.getSession()
  const resposta = await fetch(`/api/${rota}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token ?? ''}`,
    },
    body: JSON.stringify(corpo),
  })
  if (resposta.status === 401) await supabase.auth.signOut()
  return resposta
}

async function buscar(rota) {
  const resposta = await requisitar('GET', rota)
  if (!resposta.ok) throw new Error(`Falha ao buscar ${rota}`)
  return resposta.json()
}

export function DataProvider({ children }) {
  const [dados, setDados] = useState(null)
  const [erroConexao, setErroConexao] = useState(false)

  async function carregar() {
    try {
      const [doacoes, beneficiarios, entregas, resumo, cadastros] = await Promise.all([
        buscar('doacoes'),
        buscar('beneficiarios'),
        buscar('entregas'),
        buscar('resumo'),
        buscar('cadastros'),
      ])
      setDados({ doacoes, beneficiarios, entregas, resumo, cadastros })
    } catch {
      setErroConexao(true)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function enviar(metodo, rota, corpo) {
    const resposta = await requisitar(metodo, rota, corpo)
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
    opcoes: {
      categorias: dados.cadastros.categorias.map((item) => item.nome),
      tipos: dados.cadastros.tipos.map((item) => item.nome),
      regioes: dados.cadastros.regioes.map((item) => item.nome),
    },
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
    adicionarItemCadastro: (lista, nome) => enviar('POST', `cadastros/${lista}`, { nome }),
    renomearItemCadastro: (lista, nomeAtual, nome) => enviar('PUT', `cadastros/${lista}/${encodeURIComponent(nomeAtual)}`, { nome }),
    removerItemCadastro: (lista, nome) => enviar('DELETE', `cadastros/${lista}/${encodeURIComponent(nome)}`),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
