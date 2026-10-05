import { useEffect, useState } from 'react'
import useLockScroll from '../lib/useLockScroll.js'
import BouquetCard from '../components/BouquetCard.jsx'
import Photo from '../components/Photo.jsx'
import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'

export default function Home({ notify }) {
  const shopData = useShopData()
  const { settings, bouquets, flowers, allFlowers } = shopData
  const cart = useCart()
  const [category, setCategory] = useState('All')
  const [zoomed, setZoomed] = useState(null)
  useLockScroll(Boolean(zoomed))

  const categories = [...new Set(bouquets.map((b) => b.category).filter(Boolean))]
  const shown = category === 'All' ? bouquets : bouquets.filter((b) => b.category === category)

  // Recipe lines with flower names, marking anything that's out of stock
  const insideOf = (b) =>
    (b.recipe ?? [])
      .map((r, idx) => {
        const flower = allFlowers.find((f) => f.id === r.flower_id)
        if (!flower) return null
        return { key: idx, name: flower.name, color: r.color, qty: r.qty, out: !flowers.some((f) => f.id === r.flower_id) }
      })
      .filter(Boolean)

  function order(b) {
    cart.add({ kind: 'bouquet', refId: b.id, code: b.code, name: b.name, image_url: b.image_url, emoji: b.emoji })
    notify(`${b.name} added to your order`)
  }

  function makeLike(b) {
    if (cart.cart.items.length > 0 && !confirm('This will replace the flowers in your current bouquet. Continue?')) return
    const skipped = cart.loadRecipe(b, shopData)
    window.location.hash = '#/customize'
    notify(
      skipped.length
        ? `${skipped.join(', ')} ${skipped.length > 1 ? 'are' : 'is'} out of stock, so pick a replacement 🌼`
        : `Started from ${b.name}. Change anything you like!`,
    )
  }

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => e.key === 'Escape' && setZoomed(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>{settings.tagline}</h1>
          <p>Browse the bouquets we’ve made. Order one as is, or make one like it in your own colors.</p>
          <div className="hero-actions">
            <button className="btn" onClick={() => document.getElementById('bouquets').scrollIntoView({ behavior: 'smooth' })}>
              See our bouquets
            </button>
            <a href="#/customize" className="btn btn-ghost">Build from scratch</a>
          </div>
        </div>
      </section>

      <section id="bouquets" className="container section">
        <div className="section-head">
          <div>
            <h2>Bouquets we’ve made</h2>
            <p className="muted">All handmade by us. Tap a photo to see it up close.</p>
          </div>
          {categories.length > 1 && (
            <div className="filters" role="tablist">
              {['All', ...categories].map((c) => (
                <button key={c} role="tab" aria-selected={category === c} className={'chip-btn' + (category === c ? ' active' : '')} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {shown.length === 0 ? (
          <p className="muted">New bouquets coming soon 🌱</p>
        ) : (
          <div className="grid">
            {shown.map((b) => (
              <BouquetCard
                key={b.id}
                bouquet={b}
                inside={insideOf(b)}
                inCart={cart.qtyOf(b.id)}
                onOrder={() => order(b)}
                onMakeLike={() => makeLike(b)}
                onZoom={() => setZoomed(b)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container section cta">
        <div>
          <h2>Have your own idea?</h2>
          <p className="muted">Pick every flower, color, and wrap yourself, and we’ll make it for you.</p>
        </div>
        <a href="#/customize" className="btn">Build from scratch</a>
      </section>

      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(null)} role="dialog" aria-modal="true" aria-label={zoomed.name}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setZoomed(null)} aria-label="Close">×</button>
            <Photo src={zoomed.image_url} emoji={zoomed.emoji} seed={zoomed.id} alt={zoomed.name} className="lightbox-photo" full />
            <div className="lightbox-caption">
              <strong>{zoomed.code && <span className="code-inline">#{zoomed.code}</span>} {zoomed.name}</strong>
              {zoomed.description && <p className="muted small lightbox-desc">{zoomed.description}</p>}
              {insideOf(zoomed).length > 0 && (
                <p className="small lightbox-inside">
                  <span className="inside-label">What’s inside</span>
                  {insideOf(zoomed).map((i) => `${i.qty} ${i.color ? i.color + ' ' : ''}${i.name}${i.out ? ' (out of stock)' : ''}`).join(' · ')}
                </p>
              )}
              <div className="card-actions">
                <button className="btn btn-small" onClick={() => { order(zoomed); setZoomed(null) }}>Order this</button>
                {insideOf(zoomed).length > 0 && (
                  <button className="btn btn-small btn-ghost" onClick={() => { setZoomed(null); makeLike(zoomed) }}>✏️ Make one like this</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
