import { useEffect, useRef, useState } from 'react'
import useLockScroll from '../lib/useLockScroll.js'
import BouquetCard from '../components/BouquetCard.jsx'
import Photo from '../components/Photo.jsx'
import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'
import { hasPrice, peso } from '../lib/money.js'
import useReveal from '../lib/useReveal.js'
import Doodle, { Swash } from '../components/Doodle.jsx'
import OccasionTiles from '../components/home/OccasionTiles.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import AboutMaker from '../components/home/AboutMaker.jsx'

export default function Home({ notify }) {
  const shopData = useShopData()
  const { settings, bouquets, flowers, allFlowers } = shopData
  const cart = useCart()
  const [category, setCategory] = useState('All')
  const [zoomed, setZoomed] = useState(null)
  useLockScroll(Boolean(zoomed))
  const pageRef = useRef(null)
  useReveal(pageRef, [bouquets.length, category])

  const categories = [...new Set(bouquets.map((b) => b.category).filter(Boolean))]
  const counts = Object.fromEntries(categories.map((c) => [c, bouquets.filter((b) => b.category === c).length]))
  // Hero photos: the owner's picks from Admin → Shop info, otherwise her bouquets (ones with photos first)
  const picked = (settings.hero_photos ?? []).filter((p) => p?.url)
  const collage = picked.length
    ? picked.slice(0, 3).map((p, i) => ({ key: 'hero' + i, src: p.url, caption: p.caption, seed: 'hero' + i }))
    : [...bouquets]
        .sort((a, b) => Boolean(b.image_url) - Boolean(a.image_url))
        .slice(0, 3)
        .map((b) => ({ key: b.id, src: b.image_url, caption: b.name, emoji: b.emoji, seed: b.id }))

  const scrollToBouquets = () => document.getElementById('bouquets')?.scrollIntoView({ behavior: 'smooth' })
  function pickOccasion(c) {
    setCategory(c)
    scrollToBouquets()
  }
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
          <div className="hero-text">
            <p className="kicker hand">handmade with love ✿</p>
            <h1>
              {settings.tagline}
              <Swash className="hero-swash" />
            </h1>
            <p className="hero-lead">Browse the bouquets we’ve made. Order one as is, or make one like it in your own colors.</p>
            <div className="hero-actions">
              <button className="btn" onClick={scrollToBouquets}>See our bouquets</button>
              <a href="#/customize" className="btn btn-ghost">Build your own</a>
            </div>
          </div>

          <div className="hero-collage" aria-hidden="true">
            <Doodle name="sprig" size={70} className="hero-doodle d1" />
            <Doodle name="sparkle" size={34} className="hero-doodle d2" />
            <Doodle name="heart" size={30} className="hero-doodle d3" />
            {collage.map((p, i) => (
              <figure key={p.key} className={'polaroid collage-' + i}>
                <span className="tape" />
                <Photo src={p.src} emoji={p.emoji} seed={p.seed} alt="" />
                <figcaption className="polaroid-caption hand">{p.caption || '\u00a0'}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div ref={pageRef}>
        <OccasionTiles categories={categories} counts={counts} onPick={pickOccasion} />

        <section id="bouquets" className="container section bouquets">
          <div className="section-head reveal">
            <p className="kicker hand">fresh from the workbench</p>
            <h2 className="section-title">Bouquets we’ve made</h2>
            <p className="muted">All handmade by us. Tap a photo to see it up close.</p>
          </div>

          {categories.length > 1 && (
            <div className="tag-filters" role="tablist" aria-label="Filter by occasion">
              {['All', ...categories].map((c) => (
                <button key={c} role="tab" aria-selected={category === c} className={'tag-label' + (category === c ? ' active' : '')} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {shown.length === 0 ? (
            <p className="muted empty-note">New bouquets coming soon 🌱</p>
          ) : (
            <div className="bq-grid">
              {shown.map((b, i) => (
                <BouquetCard
                  key={b.id}
                  index={i}
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

        <HowItWorks />

        <section className="container section">
          <div className="cta kraft-panel reveal">
            <Doodle name="bouquet" size={64} className="cta-doodle" />
            <div className="cta-text">
              <p className="kicker hand">have your own idea?</p>
              <h2 className="section-title">Build a bouquet, stem by stem</h2>
              <p>Pick every flower, color, and wrap yourself, and we’ll make it for you.</p>
            </div>
            <a href="#/customize" className="btn">Start building →</a>
          </div>
        </section>

        <AboutMaker settings={settings} />
      </div>

      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(null)} role="dialog" aria-modal="true" aria-label={zoomed.name}>
          <div className="lightbox-inner polaroid" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setZoomed(null)} aria-label="Close">×</button>
            <Photo src={zoomed.image_url} emoji={zoomed.emoji} seed={zoomed.id} alt={zoomed.name} className="lightbox-photo" full />
            <div className="lightbox-caption">
              <strong>{zoomed.code && <span className="code-inline">#{zoomed.code}</span>} {zoomed.name}</strong>
              {hasPrice(zoomed.price) && <span className="bouquet-price">{peso(zoomed.price)}</span>}
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
