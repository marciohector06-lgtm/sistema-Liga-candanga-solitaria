const FORMATO_DATA_BRASILIA = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function gerarId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function hojeLocal(agora = new Date()) {
  return FORMATO_DATA_BRASILIA.format(agora)
}

export function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
  const data = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto
}
