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
const ShopDataContext = createContext(seedData)

export function ShopDataProvider({ children }) {
  const [data, setData] = useState(seedData)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      setData(shape(await loadAll()))
    } catch (err) {
      console.warn('Could not load shop data, showing sample data.', err)
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

  return <ShopDataContext.Provider value={{ ...data, mode, loading, reload }}>{children}</ShopDataContext.Provider>
}

export const useShopData = () => useContext(ShopDataContext)
