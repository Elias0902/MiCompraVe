import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const CURRENCIES = [
  { key: 'usd',  label: 'Dólar (USD)',     icon: 'fa-dollar-sign', color: '#2ecc71', short: 'USD' },
  { key: 'bcv',  label: 'BCV Oficial',      icon: 'fa-landmark',   color: '#9b59b6', short: 'BCV' },
  { key: 'usdt', label: 'USDT',             icon: 'fa-coins',      color: '#26a17b', short: 'USDT' },
  { key: 'eur',  label: 'Euro (EUR)',       icon: 'fa-euro-sign',  color: '#3498db', short: 'EUR' },
  { key: 'jpy',  label: 'Yen Japonés (JPY)',icon: 'fa-yen-sign',   color: '#e74c3c', short: 'JPY' },
  { key: 'krw',  label: 'Won Coreano (KRW)',icon: 'fa-won-sign',   color: '#f39c12', short: 'KRW' },
]

const API_SOURCES = [
  {
    name: 'PyDolarVE (Monitor)',
    url: 'https://pydolarve.com/api/v1/dollar?page=coinmonitor',
    async parse(res) {
      const d = await res.json()
      const usd = parseFloat(d?.usd?.promedio) || 0
      return usd > 0 ? { usd } : null
    },
  },
  {
    name: 'PyDolarVE (BCV)',
    url: 'https://pydolarve.com/api/v1/dollar?page=bcv',
    async parse(res) {
      const d = await res.json()
      const bcv = parseFloat(d?.usd?.promedio) || 0
      return bcv > 0 ? { bcv } : null
    },
  },
  {
    name: 'Bitget USDT/VES',
    url: 'https://api.bitget.com/api/v2/spot/market/tickers?symbol=USDTVES',
    async parse(res) {
      const d = await res.json()
      const ticker = d?.data?.[0]
      const usdt = parseFloat(ticker?.lastPr) || 0
      return usdt > 0 ? { usdt } : null
    },
  },
  {
    name: 'ExchangeRate API',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    async parse(res, currentRates) {
      const d = await res.json()
      const rates = d?.rates || {}
      const eur = rates?.EUR ? 1 / rates.EUR : 0
      const jpy = rates?.JPY ? 1 / rates.JPY : 0
      const krw = rates?.KRW ? 1 / rates.KRW : 0
      const result = {}
      if (eur > 0) result.eur = eur * (currentRates?.usd || 1)
      if (jpy > 0) result.jpy = jpy * (currentRates?.usd || 1)
      if (krw > 0) result.krw = krw * (currentRates?.usd || 1)
      return result
    },
  },
]

function formatBs(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Bs 0,00'
  return 'Bs ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0.00'
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return '0,00'
  return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function fetchAllRates(currentRates) {
  const results = {}

  for (const source of API_SOURCES) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 5000)
      const res = await fetch(source.url, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) continue
      const parsed = await source.parse(res, currentRates)
      if (parsed) Object.assign(results, parsed)
    } catch {}
  }

  return results
}

export default function RatesPanel({ rates, onRateChange }) {
  const [selected, setSelected] = useState('usd')
  const [amountInCur, setAmountInCur] = useState('')
  const [amountInBs, setAmountInBs] = useState('')
  const [changing, setChanging] = useState('cur')
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    const data = await fetchAllRates(rates)
    if (Object.keys(data).length > 0) {
      Object.entries(data).forEach(([key, val]) => {
        onRateChange(key, val.toString())
      })
      setLastUpdate(new Date())
    }
    setLoading(false)
  }, [rates, onRateChange])

  useEffect(() => {
    const hasAll = CURRENCIES.every(c => parseFloat(rates[c.key]) > 0)
    if (!hasAll) fetchRates()
  }, [])

  const selCurrency = CURRENCIES.find(c => c.key === selected)
  const rate = parseFloat(rates[selected]) || 0

  const handleCurChange = (val) => {
    setChanging('cur')
    setAmountInCur(val)
    const num = parseFloat(val) || 0
    if (num > 0 && rate > 0) {
      setAmountInBs((num * rate).toFixed(2))
    } else {
      setAmountInBs('')
    }
  }

  const handleBsChange = (val) => {
    setChanging('bs')
    setAmountInBs(val)
    const num = parseFloat(val) || 0
    if (num > 0 && rate > 0) {
      setAmountInCur((num / rate).toFixed(2))
    } else {
      setAmountInCur('')
    }
  }

  const curNum = parseFloat(amountInCur) || 0
  const bsNum = parseFloat(amountInBs) || 0
  const usdRate = parseFloat(rates.usd) || 0
  const usdEquivalent = selected === 'usd' ? curNum : (rate > 0 && usdRate > 0 ? (curNum * rate / usdRate) : 0)

  return (
    <motion.div
      className="tab-content-inner"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
    >
      <div className="section-header">
        <i className="fas fa-chart-line" />
        <h2>Tasas del Día</h2>
      </div>
      <p className="section-desc">
        Precios de referencia en Venezuela actualizados en tiempo real.
      </p>

      <div className="dt-dashboard glass">
        <div className="dt-header">
          <span className="dt-title"><i className="fas fa-bolt" /> MERCADO VENEZUELA</span>
          <span className="dt-update">
            {loading ? (
              <span><i className="fas fa-spinner fa-pulse" /> Cargando...</span>
            ) : lastUpdate ? (
              <span>
                <i className="fas fa-clock" />{': '}
                {lastUpdate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span><i className="fas fa-sync-alt" /></span>
            )}
          </span>
        </div>
        <div className="dt-rates">
          {CURRENCIES.map((cur, i) => {
            const val = parseFloat(rates[cur.key]) || 0
            return (
              <motion.div
                className={`dt-rate-item ${selected === cur.key ? 'active' : ''}`}
                key={cur.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => { setSelected(cur.key); setAmountInCur(''); setAmountInBs('') }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="dtr-icon" style={{ color: cur.color }}>
                  <i className={`fas ${cur.icon}`} />
                </span>
                <div className="dtr-info">
                  <span className="dtr-label">{cur.short}</span>
                  <span className="dtr-value" style={{ color: val > 0 ? cur.color : 'var(--text-dim)' }}>
                    {val > 0 ? formatCurrency(val) : <i className="fas fa-spinner fa-pulse" />}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="dt-actions">
          <motion.button
            className="btn-refresh"
            onClick={fetchRates}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-pulse' : ''}`} />
            {' '}{loading ? 'Actualizando...' : 'Actualizar Tasas'}
          </motion.button>
        </div>
      </div>

      <div className="dt-converter glass">
        <div className="dt-conv-header">
          <i className="fas fa-sync-alt" />
          <span>Conversor rápido</span>
        </div>

        <div className="dt-conv-select">
          <label>Selecciona moneda</label>
          <select value={selected} onChange={e => { setSelected(e.target.value); setAmountInCur(''); setAmountInBs('') }}>
            {CURRENCIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="dt-conv-row">
          <div className="dt-conv-input-group">
            <label>
              <i className={`fas ${selCurrency?.icon}`} style={{ color: selCurrency?.color }} />
              {' '}{selCurrency?.short}
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amountInCur}
              onChange={e => handleCurChange(e.target.value)}
            />
          </div>
          <motion.div
            className="dt-conv-arrow"
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <i className="fas fa-arrows-alt-h" />
          </motion.div>
          <div className="dt-conv-input-group">
            <label>
              <i className="fas fa-bolt" style={{ color: '#f39c12' }} />
              {' '}Bs
            </label>
            <input
              type="number"
              placeholder="0,00"
              step="0.01"
              min="0"
              value={amountInBs}
              onChange={e => handleBsChange(e.target.value)}
            />
          </div>
        </div>

        <motion.div
          className="dt-conv-result"
          key={`r-${amountInCur}-${amountInBs}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="dt-conv-result-item">
            <span className="dt-cr-label">
              <i className="fas fa-dollar-sign" style={{ color: '#2ecc71' }} /> En Dólares (USD)
            </span>
            <motion.span
              className="dt-cr-value"
              key={`usd-${usdEquivalent}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {curNum > 0 ? formatUSD(usdEquivalent) : '—'}
            </motion.span>
          </div>
          <div className="dt-conv-result-item">
            <span className="dt-cr-label">
              <i className="fas fa-bolt" style={{ color: '#f39c12' }} /> En Bolívares (Bs)
            </span>
            <motion.span
              className="dt-cr-value bs"
              key={`bs-${bsNum}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {bsNum > 0 ? formatBs(bsNum) : '—'}
            </motion.span>
          </div>
        </motion.div>

        {rate > 0 && (
          <div className="dt-conv-foot">
            <span>1 {selCurrency?.short} = {formatBs(rate)}</span>
            {usdRate > 0 && <span>1 USD = {formatBs(usdRate)}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}
