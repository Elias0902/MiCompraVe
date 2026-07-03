const TITLES = {
  inicio: 'Conversor',
  tasas: 'Tasas del día',
  afuera: 'Estoy afuera',
  carrito: 'Mi carrito',
  config: 'Configuración',
}

export default function Topbar({ onMenu, view }) {
  return (
    <header className="topbar">
      <button className="tb-menu" onClick={onMenu} aria-label="Menú">
        <i className="fas fa-bars" />
      </button>
      <img src="/logo.svg" alt="" className="tb-logo" />
      <h1 className="tb-title">{TITLES[view] || 'MiCompraVE'}</h1>
    </header>
  )
}
