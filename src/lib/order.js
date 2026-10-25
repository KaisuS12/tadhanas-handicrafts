import { hasPrice, peso } from './money.js'
import { priceSummary } from './pricing.js'

// Plain-text version of the receipt, for copying into Messenger.
export function receiptText(receipt, settings) {
  const d = receipt.details
  const lines = [
    `Hi ${settings.name}! Here's my order 💐`,
    `Order no: ${receipt.orderNo}`,
    '',
    ...receipt.items.map((i) => `• ${i.qty} × ${i.code ? `#${i.code} ` : ''}${i.name}${i.color ? ` (${i.color})` : ''}${i.kind === 'bouquet' ? ' [ready-made]' : ''}${hasPrice(i.price) ? ` — ${peso(i.price * i.qty)}` : ''}`),
    '',
  ]
  const prices = priceSummary(receipt.items)
  if (prices.hasPriced) lines.push(`${prices.hasUnpriced ? 'Bouquets subtotal' : 'Total'}: ${peso(prices.total)}${prices.hasUnpriced ? ' (+ custom flowers TBC)' : ''}`, '')
  if (receipt.basedOn) lines.push(`Inspired by: ${receipt.basedOn.code ? `#${receipt.basedOn.code} ` : ''}${receipt.basedOn.name}`)
  if (receipt.wrapper) lines.push(`Wrap: ${receipt.wrapper}`)
  if (receipt.addOns.length) lines.push(`Extras: ${receipt.addOns.join(', ')}`)
  if (receipt.cardMessage) lines.push(`Card message: "${receipt.cardMessage}"`)
  lines.push('', `Name: ${d.name}`, `Pickup/Delivery: ${d.method}`)
  if (d.date) lines.push(`Date needed: ${d.date}`)
  return lines.join('\n')
}

export const messengerUrl = (settings) => `https://m.me/${settings.messenger_username}`

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
