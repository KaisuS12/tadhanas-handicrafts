import { hasPrice } from './money.js'

// Only ready-made bouquets have prices; custom flowers are quoted on Messenger.
// items: [{ kind, qty, price }]
export function priceSummary(items) {
  const priced = items.filter((i) => i.kind === 'bouquet' && hasPrice(i.price))
  return {
    total: priced.reduce((sum, i) => sum + i.price * i.qty, 0),
    hasPriced: priced.length > 0,
    hasUnpriced: items.some((i) => !(i.kind === 'bouquet' && hasPrice(i.price))),
  }
}
