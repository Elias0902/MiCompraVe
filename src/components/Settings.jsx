import { CURRENCIES } from '../lib/currencies.js'
import Flag from './Flag.jsx'

export default function Settings({ settings, onChange }) {
  const pinned = settings.pinned && settings.pinned.length ? settings.pinned : ['bcv', 'usdt', 'eur']

  const togglePinned = (key) => {
    const has = pinned.includes(key)
    if (has && pinned.length <= 1) return // siempre al menos una
    const next = has ? pinned.filter(k => k !== key) : [...pinned, key]
    onChange({ pinned: next })
  }

  return (
    <div className="settings">
      <section className="set-card">
        <h2><i className="fas fa-palette" /> Apariencia</h2>
        <p className="set-desc">Elige cómo se ve la aplicación.</p>
        <div className="theme-toggle">
          <button className={`theme-opt ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => onChange({ theme: 'dark' })}>
            <i className="fas fa-moon" /> Oscuro
          </button>
          <button className={`theme-opt ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => onChange({ theme: 'light' })}>
            <i className="fas fa-sun" /> Claro
          </button>
        </div>
      </section>

      <section className="set-card">
        <h2><i className="fas fa-table-cells-large" /> Monedas del conversor</h2>
        <p className="set-desc">Marca las que quieres ver como botones en el conversor. El resto queda en “Más”.</p>
        <div className="set-currencies">
          {CURRENCIES.map(c => (
            <button key={c.key}
              className={`set-cur ${pinned.includes(c.key) ? 'active' : ''}`}
              onClick={() => togglePinned(c.key)}>
              <Flag iso={c.iso} size={20} />
              <span>{c.short}</span>
              {pinned.includes(c.key) && <i className="fas fa-check" />}
            </button>
          ))}
        </div>
      </section>

      <section className="set-card">
        <h2><i className="fas fa-star" /> Moneda predeterminada</h2>
        <p className="set-desc">Se mostrará primero al abrir el conversor.</p>
        <div className="set-currencies">
          {CURRENCIES.map(c => (
            <button key={c.key}
              className={`set-cur ${settings.defaultCurrency === c.key ? 'active' : ''}`}
              onClick={() => onChange({ defaultCurrency: c.key })}>
              <Flag iso={c.iso} size={20} />
              <span>{c.label}</span>
              {settings.defaultCurrency === c.key && <i className="fas fa-check" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
