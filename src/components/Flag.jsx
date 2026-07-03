// Bandera por código ISO (flagcdn). iso 'binance' -> logo de Binance. Sin iso -> moneda.
export default function Flag({ iso, size = 26 }) {
  const w = Math.round(size)
  const h = Math.round(size * 0.75)

  if (iso === 'binance') {
    return (
      <svg viewBox="0 0 32 32" width={w} height={w} className="flag-binance" aria-hidden="true">
        <g fill="#F0B90B">
          <rect x="13" y="3" width="6" height="6" rx="1" transform="rotate(45 16 6)" />
          <rect x="13" y="23" width="6" height="6" rx="1" transform="rotate(45 16 26)" />
          <rect x="3" y="13" width="6" height="6" rx="1" transform="rotate(45 6 16)" />
          <rect x="23" y="13" width="6" height="6" rx="1" transform="rotate(45 26 16)" />
          <rect x="10.5" y="10.5" width="11" height="11" rx="1.5" transform="rotate(45 16 16)" />
        </g>
      </svg>
    )
  }
  if (!iso) {
    return <span className="flag-coin" style={{ width: size, height: size * 0.75 }}><i className="fas fa-coins" /></span>
  }
  return (
    <img className="flag-img" src={`https://flagcdn.com/w40/${iso}.png`}
      width={w} height={h} alt="" loading="lazy" style={{ width: w, height: h }} />
  )
}
