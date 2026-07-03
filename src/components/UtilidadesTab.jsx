import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UtilidadesTab({ products, rates, presupuesto, onPresupuestoChange, priceHistory, onAddHistory }) {
  const [bcvVal, setBcvVal] = useState('')
  const [paraleloVal, setParaleloVal] = useState('')

  const totalUSD = products.reduce((s, p) => s + p.precioUSD, 0)
  const restante = presupuesto - totalUSD
  const pct = presupuesto > 0 ? Math.min((totalUSD / presupuesto) * 100, 100) : 0

  const barColor = pct > 90 ? '#e74c3c' : pct > 70 ? '#f39c12' : '#00b894'

  const handleSaveHistory = () => {
    const bcv = parseFloat(bcvVal)
    const paralelo = parseFloat(paraleloVal)
    if (!bcv && !paralelo) return
    onAddHistory({
      date: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      bcv: bcv || null,
      paralelo: paralelo || null,
    })
    setBcvVal('')
    setParaleloVal('')
  }

  return (
    <div className="subtab-content-inner">
      <motion.div
        className="util-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <i className="fas fa-wallet" />
          <h3>Presupuesto Mensual</h3>
        </div>

        <div className="form-row">
          <label>Presupuesto mensual ($)</label>
          <input
            type="number"
            placeholder="Ej: 500"
            step="10"
            min="0"
            value={presupuesto || ''}
            onChange={e => onPresupuestoChange(e.target.value)}
          />
        </div>

        <div className="budget-summary">
          <div className="budget-item">
            <span className="bi-label">Presupuesto</span>
            <span className="bi-value">${(presupuesto || 0).toFixed(2)}</span>
          </div>
          <div className="budget-item">
            <span className="bi-label">Gastado</span>
            <span className="bi-value">${totalUSD.toFixed(2)}</span>
          </div>
          <div className="budget-item">
            <span className="bi-label">Restante</span>
            <motion.span
              className="bi-value"
              animate={{ color: restante >= 0 ? '#00b894' : '#e74c3c' }}
            >
              ${Math.max(restante, 0).toFixed(2)}
              {restante < 0 && (
                <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}> (¡excedido!)</span>
              )}
            </motion.span>
          </div>
        </div>

        <div className="budget-bar-wrapper">
          <div className="budget-bar">
            <motion.div
              className="budget-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%`, backgroundColor: barColor }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <motion.span
            className="budget-pct"
            key={pct}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {pct.toFixed(0)}%
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        className="util-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <i className="fas fa-history" />
          <h3>Historial de Precios</h3>
        </div>
        <p className="section-desc">
          Lleva un registro de los precios del dólar BCV y del paralelo.
        </p>

        <div className="form-row dual">
          <input
            type="number"
            placeholder="BCV (Bs)"
            step="0.01"
            value={bcvVal}
            onChange={e => setBcvVal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Paralelo (Bs)"
            step="0.01"
            value={paraleloVal}
            onChange={e => setParaleloVal(e.target.value)}
          />
        </div>

        <motion.button
          className="btn-secondary"
          onClick={handleSaveHistory}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-save" /> Guardar Registro
        </motion.button>

        <AnimatePresence>
          {priceHistory.length > 0 && (
            <motion.div
              className="historial-lista"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {[...priceHistory].reverse().map((entry, i) => (
                <motion.div
                  className="historial-item"
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="hi-date">{entry.date}</span>
                  <span className="hi-value">
                    {entry.bcv !== null && <span className="hi-bcv">BCV: Bs {entry.bcv.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>}
                    {entry.paralelo !== null && <span className="hi-paralelo">Paralelo: Bs {entry.paralelo.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {priceHistory.length === 0 && (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <i className="fas fa-chart-bar" />
            <p>Aún no hay registros.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
