import Photo from './Photo.jsx'
import { hasPrice, peso } from '../lib/money.js'

// A tiny bit of hand-placed wobble so the grid doesn't look machine-made
const TILTS = ['-1.2deg', '0.8deg', '-0.5deg', '1.1deg', '-0.9deg', '0.4deg']

export default function BouquetCard({ bouquet, index = 0, inside, inCart, onOrder, onMakeLike, onZoom }) {
  return (
    <article className="bq polaroid reveal" style={{ '--tilt': TILTS[index % TILTS.length] }}>
      <button className="bq-photo" onClick={onZoom} aria-label={`View ${bouquet.name} larger`}>
        <span className="tape" aria-hidden="true" />
        <Photo src={bouquet.image_url} emoji={bouquet.emoji} seed={bouquet.id} alt={bouquet.name} />
        {bouquet.code && <span className="hang-tag">#{bouquet.code}</span>}
      </button>
      <div className="bq-body">
        <div className="bq-title">
          <h3>{bouquet.name}</h3>
          {hasPrice(bouquet.price) && <span className="bq-price hand">{peso(bouquet.price)}</span>}
        </div>
        {bouquet.category && <span className="tag-label tag-sm">{bouquet.category}</span>}
        {bouquet.description && <p className="bq-desc">{bouquet.description}</p>}
        {inside.length > 0 && (
          <div className="inside">
            <span className="inside-label hand">what’s inside</span>
            <ul>
              {inside.map((i) => (
                <li key={i.key} className={i.out ? 'out' : ''}>
                  {i.qty} {i.color && `${i.color} `}{i.name}
                  {i.out && <span className="muted"> (out of stock)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="card-actions">
          <button className="btn btn-small" onClick={onOrder}>{inCart > 0 ? `✓ Added (${inCart})` : 'Order this'}</button>
          {inside.length > 0 && <button className="btn btn-small btn-ghost" onClick={onMakeLike}>✏️ Make one like this</button>}
        </div>
      </div>
    </article>
  )
}
