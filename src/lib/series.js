// Construye la serie [{t, v}] (Bs por unidad) para una moneda, desde el histórico VES.
//  - bcv  -> v = ves del día.
//  - usdt -> no hay histórico del paralelo: se aproxima escalando el VES oficial
//            para terminar en el valor real del paralelo de hoy.
//  - resto -> v = ves_día / tasa_día (en USD).
export function buildSeries({ key, hist, histData, rates, localHistory }) {
  if (histData && histData.length >= 2) {
    if (key === 'usdt') {
      const last = histData[histData.length - 1].m.ves
      const cur = Number(rates?.usdt) || 0
      if (last > 0 && cur > 0) {
        const scale = cur / last
        return histData.filter(p => p.m.ves > 0).map(p => ({ t: p.t, v: p.m.ves * scale }))
      }
    } else if (key === 'bcv') {
      return histData.filter(p => p.m.ves > 0).map(p => ({ t: p.t, v: p.m.ves }))
    } else if (hist) {
      const pts = histData.filter(p => p.m.ves > 0 && p.m[hist] > 0).map(p => ({ t: p.t, v: p.m.ves / p.m[hist] }))
      if (pts.length >= 2) return pts
    }
  }
  if (localHistory?.length) {
    return localHistory.filter(p => p[key] > 0).map(p => ({ t: p.t, v: p[key] }))
  }
  return []
}

export function seriesChange(points) {
  if (!points || points.length < 2) return null
  const a = points[points.length - 2].v
  const b = points[points.length - 1].v
  if (a <= 0) return null
  return { pct: (b - a) / a * 100, dir: b > a ? 'up' : b < a ? 'down' : 'flat' }
}
