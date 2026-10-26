import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loadAll, mode } from './db.js'
import * as seed from '../data/shop.js'

const bySort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
const inStock = (row) => row.active !== false

// Only what customers should see: in-stock items, in the admin's order
function shape(raw) {
  const options = raw.options.filter(inStock).sort(bySort)
  return {
    settings: raw.settings,
    bouquets: raw.bouquets.filter(inStock).sort(bySort),
    flowers: raw.flowers.filter(inStock).sort(bySort),
    allFlowers: raw.flowers, // includes out-of-stock, for showing names in recipes
    wrappers: options.filter((o) => o.kind === 'wrapper'),
    addOns: options.filter((o) => o.kind === 'addon'),
  }
}

const seedData = shape(seed)

// The last shop data this phone saw, so a refresh shows the real bouquets
// instantly instead of the built-in samples (then it quietly updates).
const CACHE_KEY = 'tadhana-shop-cache-v1'
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return cached?.mode === mode ? cached.raw : null
  } catch {
    return null
  }
}
function writeCache(raw) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ mode, raw }))
  } catch {
    // storage full or blocked: just no instant start next time
  }
}

// Nothing to show yet (first visit): empty lists, so pages show loading placeholders
const emptyData = { ...seedData, bouquets: [], flowers: [], allFlowers: [], wrappers: [], addOns: [] }

function initialState() {
  const cached = readCache()
  return cached ? { data: shape(cached), ready: true } : { data: emptyData, ready: false }
}

const ShopDataContext = createContext({ ...seedData, ready: true, loading: false })

export function ShopDataProvider({ children }) {
  const [{ data, ready }, setState] = useState(initialState)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const raw = await loadAll()
      writeCache(raw)
      setState({ data: shape(raw), ready: true })
    } catch (err) {
      console.warn('Could not load shop data.', err)
      // Offline on a first visit: show the samples rather than an empty shop
      setState((s) => (s.ready ? s : { data: seedData, ready: true }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // Browser tab title follows the shop name set in admin
  useEffect(() => {
    if (data.settings?.name) document.title = data.settings.name
  }, [data.settings?.name])

  return <ShopDataContext.Provider value={{ ...data, mode, ready, loading, reload }}>{children}</ShopDataContext.Provider>
}

export const useShopData = () => useContext(ShopDataContext)
