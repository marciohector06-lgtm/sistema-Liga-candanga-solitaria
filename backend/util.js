export function gerarId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function hojeLocal() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
