// Data de hoje no fuso local, no formato aceito por <input type="date"> (AAAA-MM-DD).
// Não usar toISOString(): ele converte para UTC e, à noite em Brasília, já devolve o dia seguinte.
export function hojeLocal(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
