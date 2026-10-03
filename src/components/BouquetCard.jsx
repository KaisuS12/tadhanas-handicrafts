import Photo from './Photo.jsx'

export default function BouquetCard({ bouquet, inside, inCart, onOrder, onMakeLike, onZoom }) {
  return (
    <article className="card bouquet-card">
      <button className="photo-btn" onClick={onZoom} aria-label={`View ${bouquet.name} larger`}>
        <Photo src={bouquet.image_url} emoji={bouquet.emoji} seed={bouquet.id} alt={bouquet.name} />
        {bouquet.code && <span className="code-badge">#{bouquet.code}</span>}
      </button>
      <div className="card-body">
        {bouquet.category && <span className="chip">{bouquet.category}</span>}
        <h3>{bouquet.name}</h3>
        {bouquet.description && <p className="muted">{bouquet.description}</p>}
        {inside.length > 0 && (
          <div className="inside">
            <span className="inside-label">What’s inside</span>
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
