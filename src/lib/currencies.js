// Catálogo de monedas. group: 'main' = candidatas a pastilla; 'extra' = secundarias.
// iso = país para la bandera (flagcdn). hist = código en fawazahmed (minúscula) o null.
export const CURRENCIES = [
  { key: 'bcv',  label: 'Dólar BCV',        short: 'USD',  symbol: '$',  group: 'main',  iso: 've',      hist: 'ves' },
  { key: 'usdt', label: 'USDT (paralelo)',  short: 'USDT', symbol: '$',  group: 'main',  iso: 'binance', hist: null },
  { key: 'eur',  label: 'Euro',             short: 'EUR',  symbol: '€',  group: 'main',  iso: 'eu', hist: 'eur' },
  { key: 'jpy',  label: 'Yen japonés',      short: 'JPY',  symbol: '¥',  group: 'extra', iso: 'jp', hist: 'jpy' },
  { key: 'krw',  label: 'Won coreano',      short: 'KRW',  symbol: '₩',  group: 'extra', iso: 'kr', hist: 'krw' },
  { key: 'gbp',  label: 'Libra esterlina',  short: 'GBP',  symbol: '£',  group: 'extra', iso: 'gb', hist: 'gbp' },
  { key: 'cny',  label: 'Yuan chino',       short: 'CNY',  symbol: '¥',  group: 'extra', iso: 'cn', hist: 'cny' },
  { key: 'brl',  label: 'Real brasileño',   short: 'BRL',  symbol: 'R$', group: 'extra', iso: 'br', hist: 'brl' },
  { key: 'cop',  label: 'Peso colombiano',  short: 'COP',  symbol: '$',  group: 'extra', iso: 'co', hist: 'cop' },
  { key: 'mxn',  label: 'Peso mexicano',    short: 'MXN',  symbol: '$',  group: 'extra', iso: 'mx', hist: 'mxn' },
  { key: 'cad',  label: 'Dólar canadiense', short: 'CAD',  symbol: 'C$', group: 'extra', iso: 'ca', hist: 'cad' },
]

export const byKey = (k) => CURRENCIES.find(c => c.key === k) || CURRENCIES[0]

export function fmtBs(n) {
  if (!isFinite(n) || n <= 0) return ''
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtNum(n, dec = 2) {
  if (!isFinite(n) || n <= 0) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

// Variación usando los dos últimos puntos del historial local (respaldo).
export function change(history, key) {
  const pts = (history || []).filter(p => p[key] > 0)
  if (pts.length < 2) return null
  const prev = pts[pts.length - 2][key]
  const curr = pts[pts.length - 1][key]
  if (prev <= 0) return null
  const diff = curr - prev
  return { diff, pct: (diff / prev) * 100, dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' }
}
