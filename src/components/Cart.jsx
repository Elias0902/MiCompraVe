import { useState, useEffect } from 'react'
import { fmtBs } from '../lib/currencies.js'

const TYPES = [
  { key: 'super',    label: 'Supermercado',    icon: 'fa-cart-shopping' },
  { key: 'mercado',  label: 'Mercado / Abasto', icon: 'fa-store' },
  { key: 'chino',    label: 'Chino',            icon: 'fa-shop' },
  { key: 'farmacia', label: 'Farmacia',         icon: 'fa-prescription-bottle-medical' },
  { key: 'mall',     label: 'Centro comercial', icon: 'fa-bag-shopping' },
  { key: 'otra',     label: 'Otra tienda',      icon: 'fa-basket-shopping' },
]
const typeOf = k => TYPES.find(t => t.key === k) || TYPES[5]
const CATS = ['Comida', 'Bebidas', 'Limpieza', 'Higiene', 'Hogar', 'Ropa', 'Otros']
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export default function Cart({ stores, setStores, rates }) {
  const [openId, setOpenId] = useState(null)
  const [rateKey, setRateKey] = useState('bcv')
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('super')
  const [iName, setIName] = useState('')
  const [iCat, setICat] = useState('Comida')
  const [iPrice, setIPrice] = useState('')
  const [iQty, setIQty] = useState('1')
  const [iCurr, setICurr] = useState('usd')
  const [formErr, setFormErr] = useState('')
  const [budgetStr, setBudgetStr] = useState('')
  const [budgetCurr, setBudgetCurr] = useState('usd')
  const [toast, setToast] = useState('')

  const rate = Number(rates[rateKey]) || 0
  const store = stores.find(s => s.id === openId)
  const storeUsd = s => s.items.reduce((a, it) => a + it.usd * it.qty, 0)

  useEffect(() => { if (store) setBudgetStr(store.budget > 0 ? String(store.budget) : '') }, [openId])

  const addStore = () => {
    const name = newName.trim() || typeOf(newType).label
    const s = { id: uid(), name, type: newType, items: [], budget: 0 }
    setStores([...stores, s]); setNewName(''); setOpenId(s.id)
  }
  const removeStore = (id) => { setStores(stores.filter(s => s.id !== id)); if (openId === id) setOpenId(null) }

  const saveBudget = (str) => {
    setBudgetStr(str)
    const n = parseFloat(str) || 0
    const usd = budgetCurr === 'bs' ? (rate > 0 ? n / rate : 0) : n
    setStores(stores.map(s => s.id === openId ? { ...s, budget: usd } : s))
  }

  const prevPrice = parseFloat(iPrice) || 0
  const prevQty = parseFloat(iQty) || 0
  const prevUnitUsd = iCurr === 'bs' ? (rate > 0 ? prevPrice / rate : 0) : prevPrice
  const prevUsd = prevUnitUsd * prevQty

  const addItem = () => {
    const name = iName.trim()
    if (!name) { setFormErr('Escribe el nombre del producto.'); return }
    if (prevPrice <= 0) { setFormErr('Escribe el precio.'); return }
    if (prevQty <= 0) { setFormErr('Escribe la cantidad.'); return }
    setFormErr('')
    const item = { id: uid(), name, cat: iCat, usd: prevUnitUsd, qty: prevQty }
    setStores(stores.map(s => s.id === openId ? { ...s, items: [...s.items, item] } : s))
    setToast(`Agregado: ${name} · $${prevUsd.toFixed(2)}${rate > 0 ? ' (Bs ' + fmtBs(prevUsd * rate) + ')' : ''}`)
    setIName(''); setIPrice(''); setIQty('1')
    setTimeout(() => setToast(''), 2800)
  }
  const removeItem = (itemId) => {
    setStores(stores.map(s => s.id === openId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s))
  }

  // ---------- Lista de tiendas ----------
  if (!store) {
    return (
      <div className="cart">
        <p className="abroad-intro"><i className="fas fa-cart-shopping" /> Crea tus tiendas (supermercado, chino, farmacia…) y agrega lo que compras. Te acompaño con el total en dólares y en bolívares mientras compras.</p>

        <div className="add-store set-card">
          <h2><i className="fas fa-plus" /> Nueva tienda</h2>
          <label className="cart-label">Nombre de la tienda</label>
          <input className="cart-input" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStore()} placeholder="ej. Súper La Económica" />
          <label className="cart-label">Tipo de tienda</label>
          <div className="type-grid">
            {TYPES.map(t => (
              <button key={t.key} className={`type-chip ${newType === t.key ? 'active' : ''}`} onClick={() => setNewType(t.key)}>
                <i className={`fas ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>
          <button className="btn" onClick={addStore}><i className="fas fa-check" /> Crear tienda</button>
        </div>

        {stores.length === 0
          ? <p className="conv-updated">Aún no tienes tiendas. Crea la primera arriba.</p>
          : <div className="store-list">
              {stores.map(s => {
                const usd = storeUsd(s)
                return (
                  <div key={s.id} className="store-card" onClick={() => setOpenId(s.id)}>
                    <span className="store-ic"><i className={`fas ${typeOf(s.type).icon}`} /></span>
                    <div className="store-info">
                      <span className="store-name">{s.name}</span>
                      <span className="store-meta">{s.items.length} artículo(s) · {typeOf(s.type).label}</span>
                    </div>
                    <div className="store-tot">
                      <span>${usd.toFixed(2)}</span>
                      <span className="store-bs">Bs {rate > 0 ? fmtBs(usd * rate) : '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>}
      </div>
    )
  }

  // ---------- Detalle de tienda ----------
  const total = storeUsd(store)
  const cats = CATS.filter(c => store.items.some(i => i.cat === c))
  const budget = Number(store.budget) || 0
  const ratio = budget > 0 ? total / budget : 0
  const remaining = budget - total
  const status = budget <= 0 ? 'none' : ratio > 1 ? 'over' : ratio >= 0.7 ? 'warn' : 'ok'
  const statusMsg = {
    none: store.items.length ? '¡Vas comprando! Sigue agregando lo que eches al carrito.' : 'Agrega tu primer producto y te acompaño con el total.',
    ok: '¡Vas bien! Dentro de tu presupuesto.',
    warn: 'Ojo, te estás acercando a tu presupuesto.',
    over: `Te pasaste por $${Math.abs(remaining).toFixed(2)}${rate > 0 ? ' (Bs ' + fmtBs(Math.abs(remaining) * rate) + ')' : ''}.`,
  }[status]

  return (
    <div className="cart">
      <div className="store-head">
        <button className="back-btn" onClick={() => setOpenId(null)}><i className="fas fa-arrow-left" /></button>
        <span className="store-ic"><i className={`fas ${typeOf(store.type).icon}`} /></span>
        <h2 className="store-title">{store.name}</h2>
        <button className="del-btn" onClick={() => removeStore(store.id)} aria-label="Eliminar tienda"><i className="fas fa-trash" /></button>
      </div>

      <div className="rate-pills">
        <button className={`rate-pill ${rateKey === 'bcv' ? 'active' : ''}`} onClick={() => setRateKey('bcv')}>Tasa BCV</button>
        <button className={`rate-pill ${rateKey === 'usdt' ? 'active' : ''}`} onClick={() => setRateKey('usdt')}>Tasa USDT</button>
      </div>

      <div className={`companion ${status}`}>
        <div className="comp-top">
          <span className="comp-title"><i className="fas fa-basket-shopping" /> Llevas {store.items.length} producto(s)</span>
          <span className="comp-total">${total.toFixed(2)}</span>
        </div>
        <div className="comp-bs">Bs {rate > 0 ? fmtBs(total * rate) : '—'}</div>
        <div className="comp-budget">
          <label>Presupuesto (opcional)</label>
          <div className="price-input">
            <button className="curr-toggle" onClick={() => setBudgetCurr(c => c === 'usd' ? 'bs' : 'usd')}>{budgetCurr === 'usd' ? '$' : 'Bs'}</button>
            <input type="number" min="0" value={budgetStr} onChange={e => saveBudget(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        {budget > 0 && <div className="comp-bar"><div className={`comp-bar-fill ${status}`} style={{ width: Math.min(100, ratio * 100) + '%' }} /></div>}
        {budget > 0 && <div className="comp-remain">{remaining >= 0 ? <>Te queda <strong>${remaining.toFixed(2)}</strong>{rate > 0 ? ' · Bs ' + fmtBs(remaining * rate) : ''}</> : <>Excedido</>}</div>}
        <p className="comp-msg">{statusMsg}</p>
      </div>

      <div className="add-item set-card">
        <h2><i className="fas fa-plus" /> Agregar producto</h2>

        <label className="cart-label">Producto</label>
        <input className="cart-input" value={iName} onChange={e => setIName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="ej. Manzanas" />

        <label className="cart-label">Tipo de producto</label>
        <select className="cart-select full" value={iCat} onChange={e => setICat(e.target.value)}>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="add-grid">
          <div>
            <label className="cart-label">Precio ({iCurr === 'usd' ? 'en dólares' : 'en bolívares'})</label>
            <div className="price-input">
              <button className="curr-toggle" onClick={() => setICurr(c => c === 'usd' ? 'bs' : 'usd')}>{iCurr === 'usd' ? '$' : 'Bs'}</button>
              <input type="number" min="0" value={iPrice} onChange={e => setIPrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="cart-label">Cantidad</label>
            <input className="qty-input full" type="number" min="0" value={iQty} onChange={e => setIQty(e.target.value)} placeholder="1" />
          </div>
        </div>

        {prevUsd > 0 && (
          <div className="add-preview">
            Subtotal: <strong>${prevUsd.toFixed(2)}</strong>{rate > 0 ? <> · Bs {fmtBs(prevUsd * rate)}</> : ''}
          </div>
        )}
        {formErr && <p className="form-hint"><i className="fas fa-circle-exclamation" /> {formErr}</p>}

        <button className="btn" onClick={addItem}><i className="fas fa-cart-plus" /> Agregar al carrito</button>
      </div>

      {store.items.length === 0
        ? <p className="conv-updated">Agrega tu primer producto arriba.</p>
        : cats.map(cat => (
            <div key={cat} className="cat-block">
              <h3 className="cat-title">{cat}</h3>
              {store.items.filter(i => i.cat === cat).map(it => (
                <div key={it.id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{it.name}</span>
                    <span className="item-sub">{it.qty} × ${it.usd.toFixed(2)}</span>
                  </div>
                  <div className="item-tot">
                    <span>${(it.usd * it.qty).toFixed(2)}</span>
                    <span className="item-bs">Bs {rate > 0 ? fmtBs(it.usd * it.qty * rate) : '—'}</span>
                  </div>
                  <button className="del-btn sm" onClick={() => removeItem(it.id)} aria-label="Quitar"><i className="fas fa-xmark" /></button>
                </div>
              ))}
            </div>
          ))}

      <div className="cart-total">
        <span>Total a gastar</span>
        <div>
          <span className="ct-usd">${total.toFixed(2)}</span>
          <span className="ct-bs">Bs {rate > 0 ? fmtBs(total * rate) : '—'}</span>
        </div>
      </div>

      {toast && <div className="cart-toast"><i className="fas fa-circle-check" /> {toast}</div>}
    </div>
  )
}
