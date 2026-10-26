import FlowerCard from '../components/FlowerCard.jsx'
import CartPanel from '../components/CartPanel.jsx'
import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'
import Doodle from '../components/Doodle.jsx'

export default function Customize() {
  const { flowers, wrappers, addOns, ready } = useShopData()
  const cart = useCart()
  const { wrapperId, addOnIds, cardMessage } = cart.cart

  const main = flowers.filter((f) => f.type !== 'filler')
  const fillers = flowers.filter((f) => f.type === 'filler')

  return (
    <div className="container section">
      <header className="build-head">
        <Doodle name="bouquet" size={56} className="build-doodle" />
        <div>
          <p className="kicker hand">make it yours ✿</p>
          <h1 className="page-title">Build your bouquet</h1>
          <p className="muted">Add as many flowers as you like. We’ll confirm the price with you on Messenger.</p>
        </div>
      </header>
      <ol className="build-steps" aria-label="Steps">
        <li><span className="hand">1</span> Pick flowers</li>
        <li><span className="hand">2</span> Wrap &amp; extras</li>
        <li><span className="hand">3</span> Your details</li>
      </ol>

      <div className="customize-layout">
        <div className="customize-main">
          {!ready && (
            <div className="flower-grid" aria-busy="true" aria-label="Loading flowers">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="seed-packet is-loading">
                  <div className="packet-band"><span className="skeleton skeleton-line short" /></div>
                  <div className="photo flower-photo skeleton" />
                  <div className="flower-card-body"><span className="skeleton skeleton-line" /></div>
                </div>
              ))}
            </div>
          )}
          <FlowerSection title="Flowers" note="the stars of your bouquet" list={main} />
          <FlowerSection title="Fillers & greens" note="the soft, leafy bits" list={fillers} />

          {wrappers.length > 0 && (
            <section className="card step">
              <h3><span className="step-num hand">2</span> Wrapping</h3>
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
              <h3>Extras <span className="hand step-note">little add-ons</span></h3>
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
            <h3>Card message <span className="hand step-note">optional</span></h3>
            <textarea rows={3} maxLength={200} placeholder="Happy birthday, love! 💕" value={cardMessage} onChange={(e) => cart.set({ cardMessage: e.target.value })} />
          </section>
        </div>

        <CartPanel />
      </div>
    </div>
  )
}

function FlowerSection({ title, note, list }) {
  if (list.length === 0) return null
  return (
    <section className="step-plain">
      <h3>
        {title === 'Flowers' && <span className="step-num hand">1</span>} {title} <span className="hand step-note">{note}</span>
      </h3>
      <div className="flower-grid">
        {list.map((f) => (
          <FlowerCard key={f.id} flower={f} />
        ))}
      </div>
    </section>
  )
}
