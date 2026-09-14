import { CURRENCIES } from './currencies.js'

// Fuentes:
//  - ve.dolarapi.com  -> BCV oficial, paralelo (USDT) y euro oficial (Venezuela).
//  - open.er-api.com  -> tipos de cambio del USD para TODAS las monedas (extras, búsqueda, remesas).
//  - fawazahmed0 currency-api (jsdelivr) -> histórico diario que INCLUYE el bolívar (VES).
const URLS = {
  dolares: 'https://ve.dolarapi.com/v1/dolares',
  cotizaciones: 'https://ve.dolarapi.com/v1/cotizaciones',
  fx: 'https://open.er-api.com/v6/latest/USD',
}

async function getJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

// Devuelve { rates, fx, bcv }.
export async function fetchRates() {
  const rates = {}
  let fx = {}
  let bcv = 0

  try {
    const data = await getJSON(URLS.fx)
    fx = data?.rates || {}
    bcv = Number(fx.VES) || 0
    if (bcv > 0) {
      rates.bcv = bcv
      for (const c of CURRENCIES) {
        const sym = c.short
        if (sym && sym !== 'USD' && sym !== 'USDT' && sym !== 'PROM' && fx[sym] > 0) rates[c.key] = bcv / fx[sym]
      }
    }
  } catch { /* seguimos */ }

  try {
    const arr = await getJSON(URLS.dolares)
    const oficial = arr.find(x => x.fuente === 'oficial')
    const paralelo = arr.find(x => x.fuente === 'paralelo')
    if (oficial?.promedio > 0) { rates.bcv = oficial.promedio; bcv = oficial.promedio }
    if (paralelo?.promedio > 0) rates.usdt = paralelo.promedio
  } catch { /* usamos fx */ }

  try {
    const arr = await getJSON(URLS.cotizaciones)
    const eur = arr.find(x => x.moneda === 'EUR')
    if (eur?.promedio > 0) rates.eur = eur.promedio
  } catch { /* usamos fx */ }

  // Promedio = media entre el dólar BCV y el paralelo (USDT). Se calcula en la app.
  if (rates.bcv > 0 && rates.usdt > 0) rates.prom = (rates.bcv + rates.usdt) / 2

  return { rates, fx, bcv }
}

// Histórico diario (incluye VES). Devuelve [{ t:'YYYY-MM-DD', m:{ves, eur, jpy, ...} }] asc, o null.
// 'codes' = códigos a extraer en minúscula (debe incluir 'ves').
export async function fetchHistory(codes) {
  const fmt = d => d.toISOString().slice(0, 10)
  const dates = []
  for (let i = 30; i >= 0; i -= 4) {
    dates.push(fmt(new Date(Date.now() - i * 864e5)))
  }
  const base = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api'
  const results = await Promise.allSettled(
    dates.map(d => getJSON(`${base}@${d}/v1/currencies/usd.json`))
  )
  const out = []
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const data = r.value
    const usd = data?.usd
    if (!usd || !(usd.ves > 0)) continue
    const m = {}
    for (const c of codes) if (usd[c] > 0) m[c] = usd[c]
    out.push({ t: data.date || '', m })
  }
  const seen = new Set()
  const uniq = out.filter(p => (seen.has(p.t) ? false : (seen.add(p.t), true)))
  uniq.sort((a, b) => (a.t < b.t ? -1 : 1))
  return uniq.length ? uniq : null
}
