import { useState, useMemo } from 'react'
import { CURRENCIES, byKey, fmtBs } from '../lib/currencies.js'
import { CURRENCY_NAMES, CUR_ISO } from '../lib/countries.js'
import { buildSeries, seriesChange } from '../lib/series.js'
import { shareRate } from '../lib/share.js'
import Chart from './Chart.jsx'
import Flag from './Flag.jsx'

const COLOR = '#1FA9BC'

export default function Rates({ rates, fx, bcv, settings, localHistory, history, loading, onRefresh }) {
  const [selId, setSelId] = useState(settings.defaultCurrency || 'bcv')
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const sel = useMemo(() => {
    if (selId.startsWith('fx:')) {
      const code = selId.slice(3)
      const value = code === 'VES' ? bcv : (fx[code] > 0 ? bcv / fx[code] : 0)
      return { key: 'fx_' + code, hist: code.toLowerCase(), iso: CUR_ISO[code], label: CURRENCY_NAMES[code] || code, short: code, value }
    }
    const c = byKey(selId)
    return { key: selId, hist: c.hist, iso: c.iso, label: c.label, short: c.short, value: Number(rates[selId]) || 0 }
  }, [selId, rates, fx, bcv])

  const points = buildSeries({ key: sel.key, hist: sel.hist, histData: history, rates, localHistory })
  const sCh = seriesChange(points)
  const fecha = new Date().toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term || bcv <= 0) return []
    return Object.keys(fx)
      .filter(code => code !== 'VES' && fx[code] > 0)
      .filter(code => code.toLowerCase().includes(term) || (CURRENCY_NAMES[code] || '').toLowerCase().includes(term))
      .slice(0, 24)
      .map(code => ({ code, name: CURRENCY_NAMES[code] || code, bs: bcv / fx[code], iso: CUR_ISO[code] }))
  }, [q, fx, bcv])

  const compartir = async () => {
    if (sel.value <= 0) return
    setMsg('Preparando…')
    const r = await shareRate({ label: sel.label, short: sel.short, value: sel.value, fecha, theme: settings.theme })
    setMsg(r === 'downloaded' ? 'Imagen descargada' : r === 'shared' ? '¡Listo!' : '')
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <div className="rates-view">
      <div className="rates-card">
        <div className="rates-card-head">
          <div className="rc-head-left">
            <Flag iso={sel.iso} size={30} />
            <div>
              <span className="rc-label">{sel.label}</span>
              <span className="rc-value">Bs {sel.value > 0 ? fmtBs(sel.value) : '—'}</span>
            </div>
          </div>
          {sCh
            ? <span className={`chg big ${sCh.dir}`}><i className={`fas fa-arrow-${sCh.dir === 'down' ? 'down' : 'up'}`} />{sCh.pct >= 0 ? '+' : ''}{sCh.pct.toFixed(2)}%</span>
            : <span className="chg big flat">histórico</span>}
        </div>
        <Chart points={points} color={COLOR} />
      </div>

      <div className="search-box">
        <i className="fas fa-magnifying-glass" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar moneda (ej. peso, yen, USD)…" />
        {q && <button className="search-clear" onClick={() => setQ('')} aria-label="Limpiar"><i className="fas fa-xmark" /></button>}
      </div>

      {q ? (
        <div className="rates-list">
          {results.length === 0 && <p className="conv-updated">Sin resultados.</p>}
          {results.map(r => (
            <button key={r.code} className={`rate-row ${selId === 'fx:' + r.code ? 'active' : ''}`}
              onClick={() => { setSelId('fx:' + r.code); setQ('') }}>
              <Flag iso={r.iso} size={24} />
              <span className="rr-code">{r.code}</span>
              <span className="rr-name">{r.name}</span>
              <span className="rr-val">Bs {fmtBs(r.bs)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rates-list">
          {CURRENCIES.map(c => {
            const v = Number(rates[c.key]) || 0
            const pts = buildSeries({ key: c.key, hist: c.hist, histData: history, rates, localHistory })
            const ch = seriesChange(pts)
            return (
              <button key={c.key} className={`rate-row ${selId === c.key ? 'active' : ''}`}
                onClick={() => setSelId(c.key)}>
                <Flag iso={c.iso} size={24} />
                <span className="rr-name">{c.label}</span>
                <span className="rr-val">{v > 0 ? 'Bs ' + fmtBs(v) : '—'}</span>
                {ch
                  ? <span className={`chg ${ch.dir}`}><i className={`fas fa-arrow-${ch.dir === 'down' ? 'down' : 'up'}`} />{ch.pct >= 0 ? '+' : ''}{ch.pct.toFixed(2)}%</span>
                  : <span className="chg flat">—</span>}
              </button>
            )
          })}
        </div>
      )}

      <div className="conv-actions">
        <button className="btn" onClick={onRefresh} disabled={loading}>
          <i className={`fas fa-rotate-right ${loading ? 'spin' : ''}`} />{loading ? ' Actualizando…' : ' Actualizar'}
        </button>
        <button className="btn coral" onClick={compartir} disabled={sel.value <= 0}>
          <i className="fas fa-share-nodes" /> Compartir
        </button>
      </div>
      {msg && <p className="conv-updated">{msg}</p>}
    </div>
  )
}
