import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const CURRENCY_OPTIONS = [
  { key: 'usd', label: 'USD' },
  { key: 'eur', label: 'EUR' },
  { key: 'usdt', label: 'USDT' },
  { key: 'jpy', label: 'JPY' },
  { key: 'krw', label: 'KRW' },
  { key: 'bcv', label: 'BCV (Bs)' },
  { key: 'bs', label: 'Bolívares (Bs)' },
]

function toUSD(amount, fromKey, rates) {
  if (!amount || amount <= 0) return 0
  const rateMap = { ...rates, bs: 1 }
  const r = parseFloat(rateMap[fromKey])
  if (!r || r === 0) return 0
  const usdRate = parseFloat(rates.usd) || 1
  if (fromKey === 'usd') return amount
  const inBs = amount * r
  return inBs / usdRate
}

function toBs(amount, fromKey, rates) {
  if (!amount || amount <= 0) return 0
  const rateMap = { ...rates, bs: 1 }
  const r = parseFloat(rateMap[fromKey])
  if (!r || r === 0) return 0
  return amount * r
}

export default function ConversionTab({ rates }) {
  const [monto, setMonto] = useState('')
  const [from, setFrom] = useState('eur')
  const [to, setTo] = useState('usd')

  const [resultUSD, setResultUSD] = useState(0)
  const [resultBs, setResultBs] = useState(0)

  useEffect(() => {
    const val = parseFloat(monto) || 0
    const usdVal = toUSD(val, from, rates)
    const bsVal = toBs(val, from, rates)

    if (to === 'usd') {
      setResultUSD(usdVal)
      setResultBs(bsVal)
    } else if (to === 'bs' || to === 'bcv') {
      const bsFrom = toBs(val, from, rates)
      setResultUSD(usdVal)
      setResultBs(bsFrom)
    } else {
      const rateMap = { ...rates, bs: 1 }
      const targetRate = parseFloat(rateMap[to]) || 1
      const inBs = toBs(val, from, rates)
      setResultUSD(inBs / (parseFloat(rates.usd) || 1))
      setResultBs(inBs)
    }
  }, [monto, from, to, rates])

  const usdRate = parseFloat(rates.usd) || 0
  const fromRate = parseFloat(rates[from === 'bs' ? 'usd' : from]) || 0
  const displayRate = from === 'bs' ? 1 : fromRate

  return (
    <div className="subtab-content-inner">
      <motion.div
        className="conv-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="form-row">
          <label>Monto a convertir</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={monto}
            onChange={e => setMonto(e.target.value)}
          />
        </div>
        <div className="form-row dual">
          <div className="form-group">
            <label>Moneda origen</label>
            <select value={from} onChange={e => setFrom(e.target.value)}>
              {CURRENCY_OPTIONS.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Moneda destino</label>
            <select value={to} onChange={e => setTo(e.target.value)}>
              {CURRENCY_OPTIONS.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.div
          className="conv-result-box"
          key={`${monto}-${from}-${to}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="conv-result-item">
            <span className="cr-label"><i className="fas fa-dollar-sign" /> En Dólares (USD):</span>
            <motion.span
              className="cr-value"
              key={resultUSD}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              ${resultUSD.toFixed(2)}
            </motion.span>
          </div>
          <div className="conv-result-item">
            <span className="cr-label"><i className="fas fa-bolt" /> En Bolívares (Bs):</span>
            <motion.span
              className="cr-value"
              key={resultBs}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              Bs {resultBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </motion.span>
          </div>
        </motion.div>

        <div className="conv-detalle">
          <span>
            1 <strong>{from.toUpperCase()}</strong> ={' '}
            {displayRate > 0
              ? `Bs ${displayRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
              : '—'}
          </span>
          {usdRate > 0 && (
            <span>
              1 USD = Bs {usdRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}
