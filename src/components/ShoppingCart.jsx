import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ComercioTab from './ComercioTab.jsx'
import ConversionTab from './ConversionTab.jsx'
import UtilidadesTab from './UtilidadesTab.jsx'

const SUBTABS = [
  { key: 'comercio',   label: 'Mi Comercio',  icon: 'fa-store' },
  { key: 'conversion', label: 'Conversión',   icon: 'fa-random' },
  { key: 'utilidades', label: 'Utilidades',    icon: 'fa-lightbulb' },
]

export default function ShoppingCart({
  products, onAddProduct, onRemoveProduct,
  rates,
  presupuesto, onPresupuestoChange,
  priceHistory, onAddHistory,
}) {
  const [active, setActive] = useState('comercio')

  return (
    <motion.div
      className="tab-content-inner"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
    >
      <div className="section-header">
        <i className="fas fa-shopping-bag" />
        <h2>Carrito de Compras</h2>
      </div>

      <div className="sub-tabs">
        {SUBTABS.map(st => (
          <motion.button
            key={st.key}
            className={`sub-tab-btn ${active === st.key ? 'active' : ''}`}
            onClick={() => setActive(st.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`fas ${st.icon}`} /> {st.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active === 'comercio' && (
          <ComercioTab
            key="comercio"
            products={products}
            onAddProduct={onAddProduct}
            onRemoveProduct={onRemoveProduct}
            rates={rates}
          />
        )}
        {active === 'conversion' && (
          <ConversionTab key="conversion" rates={rates} />
        )}
        {active === 'utilidades' && (
          <UtilidadesTab
            key="utilidades"
            products={products}
            rates={rates}
            presupuesto={presupuesto}
            onPresupuestoChange={onPresupuestoChange}
            priceHistory={priceHistory}
            onAddHistory={onAddHistory}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
