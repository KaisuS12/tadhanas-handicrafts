import Doodle, { occasionDoodle } from '../Doodle.jsx'

// Big tappable occasion shortcuts that filter the bouquet grid
export default function OccasionTiles({ categories, counts, onPick }) {
  if (categories.length < 2) return null
  return (
    <section className="container section occasions reveal" aria-labelledby="occasions-title">
      <p className="kicker hand">what’s the occasion?</p>
      <h2 id="occasions-title" className="section-title">Shop by occasion</h2>
      <div className="occasion-grid">
        {categories.map((c, i) => (
          <button key={c} className={'occasion tone-' + (i % 4)} onClick={() => onPick(c)}>
            <span className="occasion-icon">
              <Doodle name={occasionDoodle(c)} size={44} />
            </span>
            <span className="occasion-name">{c}</span>
            <span className="occasion-count">{counts[c]} bouquet{counts[c] === 1 ? '' : 's'}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
