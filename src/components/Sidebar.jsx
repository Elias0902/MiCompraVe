import { motion, AnimatePresence } from 'framer-motion'

const ITEMS = [
  { key: 'inicio',  label: 'Conversor',     icon: 'fa-calculator' },
  { key: 'tasas',   label: 'Tasas',         icon: 'fa-chart-line' },
  { key: 'afuera',  label: 'Estoy afuera',  icon: 'fa-plane-departure' },
  { key: 'carrito', label: 'Mi carrito',    icon: 'fa-cart-shopping' },
  { key: 'config',  label: 'Configuración', icon: 'fa-gear' },
]

function NavContent({ view, onNavigate }) {
  return (
    <>
      <div className="sb-brand">
        <img src="/logo.svg" alt="MiCompraVE" />
        <span>MiCompra<b>VE</b></span>
      </div>
      <nav className="sb-nav">
        {ITEMS.map(it => (
          <button
            key={it.key}
            className={`sb-item ${view === it.key ? 'active' : ''}`}
            onClick={() => onNavigate(it.key)}
          >
            <i className={`fas ${it.icon}`} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <p className="sb-foot">Tasas de referencia<br />para Venezuela</p>
    </>
  )
}

export default function Sidebar({ view, onNavigate, open, onClose }) {
  return (
    <>
      <aside className="sidebar sidebar-desk">
        <NavContent view={view} onNavigate={onNavigate} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="sb-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="sidebar sidebar-drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <NavContent view={view} onNavigate={onNavigate} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
