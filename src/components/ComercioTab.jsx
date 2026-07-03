import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let productId = 0

const LUGARES = [
  { value: 'supermercado', label: 'Supermercado', icon: 'fa-shopping-basket' },
  { value: 'chino',        label: 'Chino / Bodegón', icon: 'fa-store-alt' },
  { value: 'tienda',       label: 'Tienda', icon: 'fa-store' },
  { value: 'abasto',       label: 'Abasto', icon: 'fa-apple-alt' },
  { value: 'farmacia',     label: 'Farmacia', icon: 'fa-prescription-bottle' },
  { value: 'mercado',      label: 'Mercado Municipal', icon: 'fa-carrot' },
  { value: 'otro',         label: 'Otro', icon: 'fa-map-pin' },
]

const CATEGORIAS = [
  { value: 'comida',        label: 'Comida', icon: 'fa-utensils' },
  { value: 'bebida',        label: 'Bebida', icon: 'fa-wine-bottle' },
  { value: 'limpieza',      label: 'Limpieza', icon: 'fa-pump-soap' },
  { value: 'aseo-personal', label: 'Aseo Personal', icon: 'fa-hand-sparkles' },
  { value: 'hogar',         label: 'Hogar', icon: 'fa-couch' },
  { value: 'electronica',   label: 'Electrónica', icon: 'fa-microchip' },
  { value: 'ropa',          label: 'Ropa / Calzado', icon: 'fa-tshirt' },
  { value: 'farmacia',      label: 'Medicinas', icon: 'fa-tablets' },
  { value: 'mascotas',      label: 'Mascotas', icon: 'fa-paw' },
  { value: 'otro',          label: 'Otro', icon: 'fa-tag' },
]

function formatBs(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Bs 0,00'
  return 'Bs ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0.00'
  return '$' + num.toFixed(2)
}

function getLugarIcon(value) {
  return LUGARES.find(l => l.value === value)?.icon || 'fa-map-pin'
}

function getCategoriaIcon(value) {
  return CATEGORIAS.find(c => c.value === value)?.icon || 'fa-tag'
}

export default function ComercioTab({ products, onAddProduct, onRemoveProduct, rates }) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [lugar, setLugar] = useState('supermercado')
  const [categoria, setCategoria] = useState('comida')

  const usdRate = parseFloat(rates.usd) || 0

  const handleAdd = () => {
    if (!nombre.trim() || !precio || parseFloat(precio) <= 0) return
    onAddProduct({
      id: ++productId,
      lugar,
      categoria,
      nombre: nombre.trim(),
      cantidad: parseInt(cantidad) || 1,
      precioUSD: parseFloat(precio),
    })
    setNombre('')
    setPrecio('')
    setCantidad(1)
  }

  const grouped = {}
  products.forEach(p => {
    if (!grouped[p.lugar]) grouped[p.lugar] = []
    grouped[p.lugar].push(p)
  })

  const totalUSD = products.reduce((s, p) => s + p.precioUSD * p.cantidad, 0)
  const totalBs = totalUSD * usdRate

  return (
    <div className="subtab-content-inner">
      <motion.div
        className="comercio-form glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="form-row triple">
          <div className="form-group">
            <label><i className="fas fa-map-pin" /> Lugar</label>
            <select value={lugar} onChange={e => setLugar(e.target.value)}>
              {LUGARES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-tag" /> Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-sort-amount-up" /> Cant.</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row dual">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="number"
            placeholder="Precio en $"
            step="0.01"
            min="0"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <motion.button
          className="btn-primary"
          onClick={handleAdd}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-plus" /> Agregar Producto
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {products.length === 0 ? (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.i
              className="fas fa-box-open"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
            <p>Tu carrito está vacío. ¡Agrega productos!</p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="comercio-grupos"
          >
            {Object.entries(grouped).map(([lugarKey, items]) => {
              const lugarObj = LUGARES.find(l => l.value === lugarKey) || { label: lugarKey, icon: 'fa-map-pin' }
              const subTotalUSD = items.reduce((s, p) => s + p.precioUSD * p.cantidad, 0)
              const subTotalBs = subTotalUSD * usdRate

              return (
                <motion.div
                  className="lugar-grupo"
                  key={lugarKey}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="lugar-header">
                    <i className={`fas ${lugarObj.icon}`} />
                    <span className="lugar-nombre">{lugarObj.label}</span>
                    <span className="lugar-total">
                      {formatUSD(subTotalUSD)} / {formatBs(subTotalBs)}
                    </span>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Categoría</th>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Precio ($)</th>
                          <th>Subtotal ($)</th>
                          <th>Subtotal (Bs)</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {items.map(p => (
                            <motion.tr
                              key={p.id}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 15, height: 0, padding: 0 }}
                              transition={{ duration: 0.2 }}
                              layout
                            >
                              <td>
                                <span className="cat-badge">
                                  <i className={`fas ${getCategoriaIcon(p.categoria)}`} />
                                  {' '}{CATEGORIAS.find(c => c.value === p.categoria)?.label || p.categoria}
                                </span>
                              </td>
                              <td>{p.nombre}</td>
                              <td className="num">{p.cantidad}</td>
                              <td className="num">{formatUSD(p.precioUSD)}</td>
                              <td className="num">{formatUSD(p.precioUSD * p.cantidad)}</td>
                              <td className="num">{formatBs(p.precioUSD * p.cantidad * usdRate)}</td>
                              <td>
                                <motion.button
                                  className="btn-icon"
                                  onClick={() => onRemoveProduct(p.id)}
                                  whileHover={{ scale: 1.15, color: '#e74c3c' }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <i className="fas fa-trash-alt" />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              className="lugar-grupo total-global"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="lugar-header total">
                <i className="fas fa-receipt" />
                <span className="lugar-nombre">TOTAL GENERAL</span>
                <motion.span
                  className="lugar-total"
                  key={totalUSD}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {formatUSD(totalUSD)} / {formatBs(totalBs)}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
