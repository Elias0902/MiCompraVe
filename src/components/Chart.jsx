import { fmtBs } from '../lib/currencies.js'

// Gráfica de línea simple en SVG a partir de una serie [{t, v}].
export default function Chart({ points, color = '#1FA9BC' }) {
  const vals = (points || []).map(p => p.v)
  if (vals.length < 2) {
    return (
      <div className="chart-empty">
        <i className="fas fa-chart-area" />
        <p>Aún no hay histórico para esta moneda. Se mostrará en cuanto haya datos.</p>
      </div>
    )
  }

  const W = 320, H = 120, pad = 8
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const stepX = (W - pad * 2) / (vals.length - 1)

  const xy = vals.map((v, i) => {
    const x = pad + i * stepX
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return [x, y]
  })

  const line = xy.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = `${line} L ${xy[xy.length - 1][0].toFixed(1)} ${H} L ${xy[0][0].toFixed(1)} ${H} Z`
  const last = xy[xy.length - 1]
  const fmtDate = t => { const [y, m, d] = String(t).split('-'); return d && m ? `${d}/${m}` : t }

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#cfill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
      </svg>
      <div className="chart-minmax">
        <span>{fmtDate(points[0].t)} · mín Bs {fmtBs(min)}</span>
        <span>máx Bs {fmtBs(max)} · {fmtDate(points[points.length - 1].t)}</span>
      </div>
    </div>
  )
}
