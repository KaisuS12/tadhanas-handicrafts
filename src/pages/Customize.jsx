import FlowerCard from '../components/FlowerCard.jsx'
import CartPanel from '../components/CartPanel.jsx'
import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'

export default function Customize() {
  const { flowers, wrappers, addOns } = useShopData()
  const cart = useCart()
  const { wrapperId, addOnIds, cardMessage } = cart.cart

  const main = flowers.filter((f) => f.type !== 'filler')
  const fillers = flowers.filter((f) => f.type === 'filler')

  return (
    <div className="container section">
      <h1 className="page-title">Build your bouquet</h1>
      <p className="muted">Add as many flowers as you like. We’ll confirm the price with you on Messenger.</p>

      <div className="customize-layout">
        <div className="customize-main">
          <FlowerSection title="Flowers" list={main} />
          <FlowerSection title="Fillers & greens" list={fillers} />

          {wrappers.length > 0 && (
            <section className="card step">
              <h3>Wrapping</h3>
              <div className="filters">
                {wrappers.map((w) => (
                  <button key={w.id} className={'chip-btn' + (w.id === wrapperId ? ' active' : '')} onClick={() => cart.set({ wrapperId: w.id === wrapperId ? '' : w.id })}>
                    {w.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {addOns.length > 0 && (
            <section className="card step">
              <h3>Extras</h3>
              <div className="filters">
                {addOns.map((a) => (
                  <button key={a.id} className={'chip-btn' + (addOnIds.includes(a.id) ? ' active' : '')} onClick={() => cart.toggleAddOn(a.id)}>
                    {addOnIds.includes(a.id) ? '✓ ' : '+ '}{a.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="card step">
            <h3>Card message <span className="muted small">(optional)</span></h3>
            <textarea rows={3} maxLength={200} placeholder="Happy birthday, love! 💕" value={cardMessage} onChange={(e) => cart.set({ cardMessage: e.target.value })} />
          </section>
        </div>

        <CartPanel />
      </div>
    </div>
  )
}

function FlowerSection({ title, list }) {
  if (list.length === 0) return null
  return (
    <section className="step-plain">
      <h3>{title}</h3>
      <div className="flower-grid">
        {list.map((f) => (
          <FlowerCard key={f.id} flower={f} />
        ))}
      </div>
    </section>
  )
}
