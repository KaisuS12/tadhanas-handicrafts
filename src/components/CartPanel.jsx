import { useEffect, useRef, useState } from 'react'
import useSwipeDown from '../lib/useSwipeDown.js'
import useLockScroll from '../lib/useLockScroll.js'
import { useCart } from '../lib/cart.jsx'
import { useShopData } from '../lib/shopData.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import OrderDetails, { validateDetails } from './OrderDetails.jsx'
import { hasPrice, peso } from '../lib/money.js'
import { priceSummary } from '../lib/pricing.js'

// Sticky side panel on desktop, bottom sheet on mobile.
export default function CartPanel() {
  const cart = useCart()
  const shopData = useShopData()
  const [open, setOpen] = useState(() => window.location.hash.endsWith('/bag'))
  useLockScroll(open && window.matchMedia?.('(max-width: 899px)').matches)

  // The phone tab bar's "My order" links to #/customize/bag to open this sheet
  useEffect(() => {
    const onHash = () => window.location.hash.endsWith('/bag') && setOpen(true)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function toggle() {
    if (open && window.location.hash.endsWith('/bag')) history.replaceState(null, '', '#/customize')
    setOpen((o) => !o)
  }

  // Phones/tablets: drag the open sheet down to close it
  const sheetRef = useRef(null)
  const bodyRef = useRef(null)
  const isSheet = window.matchMedia?.('(max-width: 899px)').matches
  useSwipeDown(sheetRef, () => open && toggle(), { enabled: open && isSheet, scrollRef: bodyRef })
  const [showErrors, setShowErrors] = useState(false)
  const { items, details, basedOn } = cart.cart
  const priceOf = (i) => (i.kind === 'bouquet' ? shopData.bouquets.find((b) => b.id === i.refId)?.price : null)
  const prices = priceSummary(items.map((i) => ({ ...i, price: priceOf(i) })))

  function placeOrder() {
    if (Object.keys(validateDetails(details)).length > 0) {
      setShowErrors(true)
      return
    }
    cart.placeOrder(shopData)
    window.location.hash = '#/receipt'
  }

  return (
    <>
      {open && <div className="sheet-backdrop" onClick={toggle} aria-hidden="true" />}
      <aside ref={sheetRef} className={'card cart-panel' + (open ? ' open' : '')}>
        <button className="cart-bar" onClick={toggle} aria-expanded={open}>
          <span className="sheet-handle" aria-hidden="true" />
          <span>{open ? 'My bouquet' : `💐 View my bouquet (${cart.count})`}</span>
          <span aria-hidden="true">{open ? '✕' : '▴'}</span>
        </button>

        <div className="cart-body" ref={bodyRef}>
          <h3 className="cart-title"><span className="step-num hand">3</span> My order</h3>
          {cart.removed.length > 0 && (
            <p className="stock-notice" role="status">
              Sorry, {new Intl.ListFormat('en').format(cart.removed)} {cart.removed.length > 1 ? 'are' : 'is'} no longer available, so we took {cart.removed.length > 1 ? 'them' : 'it'} out of your bouquet.
              <button className="icon-btn" onClick={cart.dismissRemoved} aria-label="Dismiss">×</button>
            </p>
          )}
          {basedOn && (
            <p className="based-on">
              ✏️ Based on {basedOn.code && <strong>#{basedOn.code}</strong>} {basedOn.name}
              <button className="icon-btn" onClick={() => cart.set({ basedOn: null })} aria-label="Remove reference">×</button>
            </p>
          )}
          {items.length === 0 ? (
            <p className="muted">No flowers yet. Tap “+ Add” on any flower 🌱</p>
          ) : (
            <ul className="cart-lines">
              {items.map((i) => (
                <li key={i.key}>
                  <div className="cart-line-name">
                    {i.code && <span className="code-inline">#{i.code}</span>}
                    <strong>{i.name}</strong>
                    {i.color && <span className="muted small"> · {i.color}</span>}
                    {i.kind === 'bouquet' && <span className="chip chip-xs">ready-made</span>}
                    {hasPrice(priceOf(i)) && <span className="cart-line-price">{peso(priceOf(i) * i.qty)}</span>}
                  </div>
                  <QuantityStepper value={i.qty} onChange={(q) => cart.setQty(i.key, q)} label={i.name} />
                  <button className="icon-btn" onClick={() => cart.remove(i.key)} aria-label={`Remove ${i.name}`}>×</button>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">{cart.count} item{cart.count === 1 ? '' : 's'}</p>
          {prices.hasPriced && (
            <div className="cart-total">
              <span>{prices.hasUnpriced ? 'Bouquets subtotal' : 'Total'}</span>
              <strong>{peso(prices.total)}</strong>
            </div>
          )}
          {prices.hasPriced && prices.hasUnpriced && <p className="muted small">+ your custom flowers, which we’ll price on Messenger.</p>}

          <OrderDetails details={details} onChange={(d) => cart.set({ details: d })} showErrors={showErrors} />

          <button className="btn btn-block" disabled={items.length === 0} onClick={placeOrder}>
            Place order
          </button>
          <p className="muted small center">You’ll get a receipt to send to our Facebook page. We’ll reply with the price.</p>
        </div>
      </aside>
    </>
  )
}
