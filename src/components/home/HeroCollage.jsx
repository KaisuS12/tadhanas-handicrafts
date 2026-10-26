import { useEffect, useRef, useState } from 'react'
import Photo from '../Photo.jsx'
import Doodle from '../Doodle.jsx'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// The polaroid stack at the top of the home page.
// Tap (or swipe on a phone) to shuffle: the front photo is tossed aside and
// tucked behind, and the next one glides to the front.
export default function HeroCollage({ items, ready }) {
  const signature = items.map((p) => p.key).join('|')
  const [deck, setDeck] = useState(() => items.map((_, i) => i)) // deck[spot] = item index; last spot is the front
  const [shuffled, setShuffled] = useState(false)
  const figRefs = useRef([])
  const busy = useRef(false)
  const touchX = useRef(null)

  // New photos from the shop: start the stack fresh
  useEffect(() => {
    setDeck(items.map((_, i) => i))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  // Until the reset above runs, use the starting order (never an empty/old deck,
  // which would pile every photo into one spot and slide them out on load)
  const order = deck.length === items.length ? deck : items.map((_, i) => i)
  const canShuffle = ready && items.length > 1

  function shuffle(dir = 1) {
    if (!canShuffle || busy.current) return
    busy.current = true
    setShuffled(true)
    const front = order[order.length - 1]
    const next = [front, ...order.slice(0, -1)] // front goes to the back, everyone moves up one
    const el = figRefs.current[front]
    if (el && typeof el.animate === 'function' && !reducedMotion()) {
      el.animate(
        [
          { transform: 'rotate(-2deg)' },
          { transform: `translate(${dir * 75}%, -12%) rotate(${dir * 16}deg) scale(1.03)`, offset: 0.42 },
          { transform: 'translate(0, 0) rotate(-8deg) scale(0.97)' },
        ],
        { duration: 720, easing: 'cubic-bezier(.3,.7,.2,1)' },
      )
      setTimeout(() => setDeck(next), 300) // tuck it behind while it's out to the side
      setTimeout(() => (busy.current = false), 720)
    } else {
      setDeck(next)
      busy.current = false
    }
  }

  const spotClass = (itemIndex) => {
    const spot = order.indexOf(itemIndex) + (3 - items.length) // keep the front in the front spot
    return 'slot-' + Math.max(0, spot)
  }

  return (
    <div
      className={'hero-collage' + (canShuffle ? ' can-shuffle' : '')}
      role={canShuffle ? 'button' : undefined}
      tabIndex={canShuffle ? 0 : undefined}
      aria-label={canShuffle ? 'Shuffle the photos' : undefined}
      aria-hidden={canShuffle ? undefined : true}
      onClick={() => shuffle(1)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          shuffle(1)
        }
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0)
        if (Math.abs(dx) > 40) {
          e.preventDefault() // a swipe, not a tap: don't also fire the click
          shuffle(dx > 0 ? 1 : -1)
        }
        touchX.current = null
      }}
    >
      <Doodle name="sprig" size={70} className="hero-doodle d1 draw" />
      <Doodle name="sparkle" size={34} className="hero-doodle d2 draw" />
      <Doodle name="heart" size={30} className="hero-doodle d3 draw" />

      {!ready &&
        [0, 1, 2].map((i) => (
          <figure key={'wait' + i} className={'polaroid slot-' + i + ' is-loading'}>
            <span className="tape" />
            <div className="photo skeleton" />
            <figcaption className="polaroid-caption hand">{' '}</figcaption>
          </figure>
        ))}

      {ready &&
        items.map((p, i) => (
          <figure key={p.key} ref={(el) => (figRefs.current[i] = el)} className={'polaroid ' + spotClass(i)} style={{ '--n': i }}>
            <span className={'tape' + (i === 1 ? ' tape-sage' : '')} />
            <Photo src={p.src} emoji={p.emoji} seed={p.seed} alt="" />
            <figcaption className="polaroid-caption hand">{p.caption || ' '}</figcaption>
          </figure>
        ))}

      {canShuffle && <span className={'shuffle-hint hand' + (shuffled ? ' gone' : '')} aria-hidden="true">tap to shuffle ↻</span>}
    </div>
  )
}
