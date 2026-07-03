import { useState, useMemo } from 'react'
import { COUNTRIES, CURRENCY_NAMES } from '../lib/countries.js'
import { fmtBs, fmtNum } from '../lib/currencies.js'
import Flag from './Flag.jsx'

export default function Abroad({ fx, bcv, loading, onRefresh }) {
  const [country, setCountry] = useState(COUNTRIES.find(c => c.cur === 'MXN') || COUNTRIES[0])
  const [amount, setAmount] = useState('20')
  const [q, setQ] = useState('')

  const perUnit = useMemo(() => {
    if (bcv <= 0) return 0
    if (country.cur === 'USD') return bcv
    return fx[country.cur] > 0 ? bcv / fx[country.cur] : 0
  }, [country, fx, bcv])

  const amt = parseFloat(amount) || 0
  const bs = amt * perUnit

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return COUNTRIES
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(t) || c.cur.toLowerCase().includes(t) ||
      (CURRENCY_NAMES[c.cur] || '').toLowerCase().includes(t))
  }, [q])

  return (
    <div className="abroad">
      <p className="abroad-intro">
        <i className="fas fa-plane-departure" /> ¿Vas a enviar dinero a Venezuela? Elige tu país y mira cuántos bolívares llegan.
      </p>

      <div className="abroad-card">
        <div className="ab-from">
          <Flag iso={country.iso} size={40} />
          <div>
            <span className="ab-country">{country.name}</span>
            <span className="ab-curname">{CURRENCY_NAMES[country.cur] || country.cur} ({country.cur})</span>
          </div>
        </div>

        <label className="ab-label">Envías</label>
        <div className="ab-input">
          <span>{country.cur}</span>
          <input type="number" inputMode="decimal" min="0" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="0.00" />
        </div>

        <div className="ab-arrow"><i className="fas fa-arrow-down" /></div>

        <label className="ab-label">Reciben en Venezuela</label>
        <div className="ab-result">{perUnit > 0 ? 'Bs ' + fmtBs(bs) : '—'}</div>

        {perUnit > 0 && (
          <p className="ab-rate">1 {country.cur} = Bs {fmtNum(perUnit, perUnit < 1 ? 4 : 2)}</p>
        )}
      </div>

      <div className="search-box">
        <i className="fas fa-magnifying-glass" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca tu país o moneda…" />
        {q && <button className="search-clear" onClick={() => setQ('')} aria-label="Limpiar"><i className="fas fa-xmark" /></button>}
      </div>

      <div className="country-list">
        {list.map(c => (
          <button key={c.name} className={`country-chip ${country.name === c.name ? 'active' : ''}`}
            onClick={() => { setCountry(c); setQ('') }}>
            <Flag iso={c.iso} size={24} />
            <span className="cc-name">{c.name}</span>
            <span className="cc-cur">{c.cur}</span>
          </button>
        ))}
      </div>

      <div className="conv-actions">
        <button className="btn" onClick={onRefresh} disabled={loading}>
          <i className={`fas fa-rotate-right ${loading ? 'spin' : ''}`} /> {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>
    </div>
  )
}
