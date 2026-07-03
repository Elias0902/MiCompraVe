import { fmtBs } from './currencies.js'

// Dibuja una tarjeta de marca con la tasa y la comparte o la descarga.
export async function shareRate({ label, short, value, fecha, theme = 'dark' }) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  const dark = theme !== 'light'
  const bg = dark ? '#1a1a1a' : '#F7F4EC'
  const card = dark ? '#222222' : '#FFFFFF'
  const text = dark ? '#F2EFE8' : '#1E3A40'
  const muted = dark ? '#A6A6A0' : '#5E767B'
  const teal = '#1FA9BC'
  const coral = '#F0795E'

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Tarjeta
  const m = 90
  roundRect(ctx, m, m, W - 2 * m, H - 2 * m, 48)
  ctx.fillStyle = card
  ctx.fill()

  // Barra superior teal
  roundRect(ctx, m, m, W - 2 * m, 18, 9)
  ctx.fillStyle = teal
  ctx.fill()

  ctx.textAlign = 'center'

  // Marca
  ctx.font = '700 60px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = teal
  ctx.fillText('MiCompra', W / 2 - 52, m + 150)
  const w1 = ctx.measureText('MiCompra').width
  ctx.fillStyle = coral
  ctx.fillText('VE', W / 2 - 52 + w1 / 2 + 32, m + 150)

  // Moneda
  ctx.font = '500 46px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = muted
  ctx.fillText(label, W / 2, m + 300)

  // Valor grande
  ctx.font = '800 130px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = text
  ctx.fillText('Bs ' + fmtBs(value), W / 2, m + 470)

  // Equivalencia
  ctx.font = '400 40px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = muted
  ctx.fillText(`1 ${short} = Bs ${fmtBs(value)}`, W / 2, m + 580)

  // Fecha
  ctx.font = '400 36px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = coral
  ctx.fillText(fecha, W / 2, H - m - 90)

  ctx.font = '400 30px Segoe UI, system-ui, sans-serif'
  ctx.fillStyle = muted
  ctx.fillText('Tasas de referencia para Venezuela', W / 2, H - m - 40)

  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
  const file = new File([blob], 'micompreve.png', { type: 'image/png' })
  const texto = `${label}: Bs ${fmtBs(value)} — ${fecha} · MiCompraVE`

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'MiCompraVE', text: texto })
      return 'shared'
    }
    if (navigator.share) {
      await navigator.share({ title: 'MiCompraVE', text: texto })
      return 'shared'
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled'
  }

  // Fallback: descargar la imagen.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'micompreve.png'
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
