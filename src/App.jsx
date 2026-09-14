import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Converter from './components/Converter.jsx'
import Rates from './components/Rates.jsx'
import Abroad from './components/Abroad.jsx'
import Cart from './components/Cart.jsx'
import Settings from './components/Settings.jsx'
import { fetchRates, fetchHistory } from './lib/api.js'
import { todayKey } from './lib/currencies.js'
import './App.css'

const STORAGE_KEY = 'micompreve-v4'
const HIST_CODES = ['ves', 'eur', 'jpy', 'krw', 'gbp', 'cny', 'brl', 'mxn', 'cad', 'cop',
  'clp', 'pen', 'ars', 'aud', 'chf', 'try', 'inr', 'zar', 'dop', 'bob', 'uyu', 'pyg',
  'crc', 'gtq', 'hnl', 'nio', 'sar', 'aed', 'rub']
const DEFAULT_SETTINGS = { theme: 'dark', defaultCurrency: 'bcv', pinned: ['bcv', 'usdt', 'prom', 'eur'] }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

// Une los ajustes guardados con los por defecto y asegura que la pastilla
// "Promedio" (prom) aparezca aunque el usuario ya tuviera ajustes previos.
function initSettings(saved) {
  const merged = { ...DEFAULT_SETTINGS, ...(saved?.settings || {}) }
  if (!Array.isArray(merged.pinned) || merged.pinned.length === 0) {
    merged.pinned = [...DEFAULT_SETTINGS.pinned]
  }
  if (!merged.pinned.includes('prom')) {
    const i = merged.pinned.indexOf('usdt')
    if (i >= 0) merged.pinned.splice(i + 1, 0, 'prom')
    else merged.pinned.push('prom')
  }
  return merged
}

export default function App() {
  const saved = loadState()
  const [settings, setSettings] = useState(() => initSettings(saved))
  const [rates, setRates] = useState(saved?.rates || {})
  const [fx, setFx] = useState(saved?.fx || {})
  const [bcv, setBcv] = useState(saved?.bcv || 0)
  const [localHistory, setLocalHistory] = useState(saved?.localHistory || [])
  const [history, setHistory] = useState(saved?.history || null)
  const [stores, setStores] = useState(saved?.stores || [])
  const [lastUpdate, setLastUpdate] = useState(saved?.lastUpdate ? new Date(saved.lastUpdate) : null)
  const [view, setView] = useState('inicio')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { rates: r, fx: fxMap, bcv: b } = await fetchRates()
    if (Object.keys(r).length > 0) {
      setRates(prev => ({ ...prev, ...r }))
      if (fxMap && Object.keys(fxMap).length) setFx(fxMap)
      if (b > 0) setBcv(b)
      setLastUpdate(new Date())
      setLocalHistory(prev => {
        const point = { t: todayKey(), ...r }
        const next = prev.length && prev[prev.length - 1].t === point.t
          ? [...prev.slice(0, -1), point]
          : [...prev, point]
        return next.slice(-60)
      })
    } else {
      setError(true)
    }
    setLoading(false)
  }, [])

  const loadHistory = useCallback(async () => {
    const h = await fetchHistory(HIST_CODES)
    if (h) setHistory(h)
  }, [])

  useEffect(() => { refresh(); loadHistory() }, [refresh, loadHistory])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings, rates, fx, bcv, localHistory, history, stores,
      lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
    }))
  }, [settings, rates, fx, bcv, localHistory, history, stores, lastUpdate])

  const go = (v) => { setView(v); setDrawerOpen(false) }
  const updateSettings = (patch) => setSettings(prev => ({ ...prev, ...patch }))

  return (
    <div className="layout">
      <Sidebar view={view} onNavigate={go} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="main">
        <Topbar onMenu={() => setDrawerOpen(true)} view={view} />
        <div className="content">
          {view === 'inicio' && (
            <Converter rates={rates} history={history} localHistory={localHistory} settings={settings}
              loading={loading} error={error} lastUpdate={lastUpdate} onRefresh={refresh} />
          )}
          {view === 'tasas' && (
            <Rates rates={rates} fx={fx} bcv={bcv} settings={settings}
              localHistory={localHistory} history={history}
              loading={loading} onRefresh={refresh} />
          )}
          {view === 'afuera' && (
            <Abroad fx={fx} bcv={bcv} loading={loading} onRefresh={refresh} />
          )}
          {view === 'carrito' && (
            <Cart stores={stores} setStores={setStores} rates={rates} onRefresh={refresh} loading={loading} />
          )}
          {view === 'config' && (
            <Settings settings={settings} onChange={updateSettings} />
          )}
        </div>
      </div>
    </div>
  )
}
