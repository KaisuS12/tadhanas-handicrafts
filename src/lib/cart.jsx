import { createContext, useContext, useEffect, useState } from 'react'
import { useShopData } from './shopData.jsx'

const CART_KEY = 'tadhana-cart'
const RECEIPT_KEY = 'tadhana-receipt'

const emptyCart = () => ({
  items: [], // { key, kind: 'flower' | 'bouquet', refId, name, color, qty, image_url, emoji }
  wrapperId: '',
  addOnIds: [],
  cardMessage: '',
  basedOn: null, // { code, name } when started from "Make one like this"
  details: { name: '', method: 'Pickup', date: '' },
})

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked (private mode); the cart just won't survive a refresh
  }
}

const itemKey = (refId, color) => (color ? `${refId}::${color}` : refId)

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => load(CART_KEY, emptyCart()))
  const [receipt, setReceipt] = useState(() => load(RECEIPT_KEY, null))

  useEffect(() => save(CART_KEY, cart), [cart])
  useEffect(() => save(RECEIPT_KEY, receipt), [receipt])

  // A saved order may hold things that went out of stock since the last visit.
  // Once the real shop data has loaded, drop those and tell the customer.
  const shop = useShopData()
  const [removed, setRemoved] = useState([]) // names of items taken out
  useEffect(() => {
    if (shop.loading) return
    setCart((c) => {
      const gone = []
      const items = c.items.filter((i) => {
        const ok =
          i.kind === 'bouquet'
            ? shop.bouquets.some((b) => b.id === i.refId)
            : shop.flowers.some((f) => f.id === i.refId && (!i.color || (f.colors ?? []).includes(i.color)))
        if (!ok) gone.push(i.color ? `${i.name} (${i.color})` : i.name)
        return ok
      })
      const wrapperOk = !c.wrapperId || shop.wrappers.some((w) => w.id === c.wrapperId)
      const addOnIds = c.addOnIds.filter((id) => shop.addOns.some((a) => a.id === id))
      if (!wrapperOk) gone.push('your chosen wrap')
      if (addOnIds.length !== c.addOnIds.length) gone.push('an extra')
      if (gone.length === 0) return c
      setRemoved(gone)
      return { ...c, items, wrapperId: wrapperOk ? c.wrapperId : '', addOnIds }
    })
  }, [shop.loading, shop.bouquets, shop.flowers, shop.wrappers, shop.addOns])

  const update = (patch) => setCart((c) => ({ ...c, ...(typeof patch === 'function' ? patch(c) : patch) }))

  const actions = {
    qtyOf: (refId, color) => cart.items.find((i) => i.key === itemKey(refId, color))?.qty ?? 0,

    add: (item, qty = 1) =>
      update((c) => {
        const key = itemKey(item.refId, item.color)
        const existing = c.items.find((i) => i.key === key)
        if (existing) return { items: c.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)) }
        return { items: [...c.items, { ...item, key, qty }] }
      }),

    setQty: (key, qty) =>
      update((c) => ({
        items: qty > 0 ? c.items.map((i) => (i.key === key ? { ...i, qty } : i)) : c.items.filter((i) => i.key !== key),
      })),

    remove: (key) => update((c) => ({ items: c.items.filter((i) => i.key !== key) })),

    toggleAddOn: (id) =>
      update((c) => ({ addOnIds: c.addOnIds.includes(id) ? c.addOnIds.filter((a) => a !== id) : [...c.addOnIds, id] })),

    set: update,

    // "Make one like this": start the builder from a bouquet's recipe.
    // Returns the names of flowers that are out of stock and were skipped.
    loadRecipe: (bouquet, shopData) => {
      const skipped = []
      const items = []
      for (const r of bouquet.recipe ?? []) {
        const flower = shopData.flowers.find((f) => f.id === r.flower_id)
        if (!flower) {
          const name = shopData.allFlowers.find((f) => f.id === r.flower_id)?.name
          if (name) skipped.push(name)
          continue
        }
        const color = flower.colors?.includes(r.color) ? r.color : (flower.colors?.[0] ?? '')
        items.push({ key: itemKey(flower.id, color), kind: 'flower', refId: flower.id, name: flower.name, color, qty: r.qty, image_url: flower.image_url, emoji: flower.emoji })
      }
      const wrapperOk = shopData.wrappers.some((w) => w.id === bouquet.wrapper_id)
      update({ items, wrapperId: wrapperOk ? bouquet.wrapper_id : '', basedOn: { code: bouquet.code ?? '', name: bouquet.name } })
      return skipped
    },

    // Freeze the cart into a receipt the customer can save and send
    placeOrder: (shopData) => {
      const now = new Date()
      const ymd = now.toISOString().slice(2, 10).replace(/-/g, '')
      const snapshot = {
        orderNo: `TH-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now.toISOString(),
        items: cart.items.map(({ kind, code, name, color, qty }) => ({ kind, code, name, color, qty })),
        basedOn: cart.basedOn,
        wrapper: shopData.wrappers.find((w) => w.id === cart.wrapperId)?.name ?? '',
        addOns: shopData.addOns.filter((a) => cart.addOnIds.includes(a.id)).map((a) => a.name),
        cardMessage: cart.cardMessage.trim(),
        details: cart.details,
      }
      setReceipt(snapshot)
      setCart(emptyCart()) // the receipt keeps the order; the cart starts fresh
      return snapshot
    },
  }

  const count = cart.items.reduce((sum, i) => sum + i.qty, 0)

  const dismissRemoved = () => setRemoved([])

  return <CartContext.Provider value={{ cart, receipt, count, removed, dismissRemoved, ...actions }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
