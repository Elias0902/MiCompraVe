import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CURRENCIES, byKey, fmtBs } from '../lib/currencies.js'
import { buildSeries, seriesChange } from '../lib/series.js'
import { shareRate } from '../lib/share.js'
import Flag from './Flag.jsx'

export default function Converter({ rates, history, localHistory, settings, loading, error, lastUpdate, onRefresh }) {
  const pinned = settings.pinned && settings.pinned.length ? settings.pinned : ['bcv', 'usdt', 'eur']
  const mainList = pinned.map(byKey)
  const extraList = CURRENCIES.filter(c => !pinned.includes(c.key))

  const [sel, setSel] = useState(settings.defaultCurrency || 'bcv')
  const [dir, setDir] = useState('curToBs')
  const [cur, setCur] = useState('1')
  const [bs, setBs] = useState('')
  const [edited, setEdited] = useState('cur')
  const [showExtra, setShowExtra] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  useEffect(() => { setSel(settings.defaultCurrency || 'bcv') }, [settings.defaultCurrency])

  const opt = byKey(sel)
  const rate = Number(rates[sel]) || 0
  const points = buildSeries({ key: sel, hist: opt.hist, histData: history, rates, localHistory })
  const ch = seriesChange(points)

  const computed = useMemo(() => {
    if (rate <= 0) return { cur, bs }
    if (edited === 'cur') {
      const a = parseFloat(cur)
      return { cur, bs: a > 0 ? (a * rate).toFixed(2) : '' }
    }
    const b = parseFloat(bs)
    return { cur: b > 0 ? (b / rate).toFixed(2) : '', bs }
  }, [cur, bs, rate, edited])

  const onCur = (v) => { setEdited('cur'); setCur(v) }
  const onBs = (v) => { setEdited('bs'); setBs(v) }
  const pickCurrency = (k) => { setSel(k); setShowExtra(false); setEdited('cur'); setCur('1'); setBs('') }
  const swap = () => setDir(d => (d === 'curToBs' ? 'bsToCur' : 'curToBs'))
  const limpiar = () => { setCur('1'); setBs(''); setEdited('cur'); setDir('curToBs'); onRefresh() }

  const fecha = new Date().toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  const compartir = async () => {
    if (rate <= 0) return
    setShareMsg('Preparando…')
    const r = await shareRate({ label: opt.label, short: opt.short, value: rate, fecha, theme: settings.theme })
    setShareMsg(r === 'downloaded' ? 'Imagen descargada' : r === 'shared' ? '¡Listo!' : '')
    setTimeout(() => setShareMsg(''), 2500)
  }

  const curField = (
    <div className="conv-field" key="cur">
      <span className="conv-cur">{opt.symbol} {opt.short}</span>
      <input type="number" inputMode="decimal" min="0" placeholder="0.00"
        value={computed.cur} onChange={e => onCur(e.target.value)} />
    </div>
  )
  const bsField = (
    <div className="conv-field bs" key="bs">
      <span className="conv-cur">Bs</span>
      <input type="number" inputMode="decimal" min="0" placeholder="0,00"
        value={computed.bs} onChange={e => onBs(e.target.value)} />
    </div>
  )
  const fields = dir === 'curToBs' ? [curField, bsField] : [bsField, curField]

  return (
    <div className="converter">
      <div className="rate-pills">
        {mainList.map(o => (
          <button key={o.key} className={`rate-pill ${sel === o.key ? 'active' : ''}`}
            onClick={() => pickCurrency(o.key)}>{o.short}</button>
        ))}
        {extraList.length > 0 && (
          <button className={`rate-pill extra ${extraList.some(e => e.key === sel) ? 'active' : ''}`}
            onClick={() => setShowExtra(s => !s)}>
            <i className="fas fa-plus" /> Más
          </button>
        )}
      </div>

      <AnimatePresence>
        {showExtra && (
          <motion.div className="extra-grid"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {extraList.map(o => (
              <button key={o.key} className={`extra-chip ${sel === o.key ? 'active' : ''}`}
                onClick={() => pickCurrency(o.key)}>
                <Flag iso={o.iso} size={22} />
                <span>{o.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="conv-card">
        {fields[0]}
        <button className="conv-swap" onClick={swap} aria-label="Invertir">
          <i className="fas fa-arrow-up" />
          <i className="fas fa-arrow-down" />
        </button>
        {fields[1]}

        {rate > 0 ? (
          <div className="conv-rate-row">
            <span className="conv-rate">1 {opt.short} = <strong>Bs {fmtBs(rate)}</strong></span>
            {ch && (
              <span className={`chg ${ch.dir}`}>
                <i className={`fas fa-arrow-${ch.dir === 'down' ? 'down' : 'up'}`} />
                {ch.pct >= 0 ? '+' : ''}{ch.pct.toFixed(2)}%
              </span>
            )}
          </div>
        ) : (
          <p className="conv-rate">{loading ? 'Cargando tasa…' : 'Sin datos, actualiza.'}</p>
        )}
      </div>

      <div className="conv-actions">
        <button className="btn ghost" onClick={limpiar}><i className="fas fa-eraser" /> Limpiar</button>
        <button className="btn" onClick={onRefresh} disabled={loading}>
          <i className={`fas fa-rotate-right ${loading ? 'spin' : ''}`} />{loading ? ' Actualizando…' : ' Actualizar'}
        </button>
        <button className="btn coral" onClick={compartir} disabled={rate <= 0}>
          <i className="fas fa-share-nodes" /> Compartir
        </button>
      </div>

      {shareMsg && <p className="conv-updated">{shareMsg}</p>}
      {error && <p className="conv-error"><i className="fas fa-triangle-exclamation" /> No se pudieron actualizar las tasas. Revisa tu conexión.</p>}
      {!error && lastUpdate && (
        <p className="conv-updated">
          <i className="far fa-clock" /> {fecha} · Actualizado {lastUpdate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
