import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      className="app-header"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
    >
      <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="MiCompraVE" className="app-logo" />
      <h1 className="app-title">
        MiCompra<span>VE</span>
      </h1>
      <p className="app-subtitle">Cambia de dólares a bolívares al instante</p>
    </motion.header>
  )
}
