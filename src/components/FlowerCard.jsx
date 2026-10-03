import { useState } from 'react'
import Photo from './Photo.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import { useCart } from '../lib/cart.jsx'

export default function FlowerCard({ flower }) {
  const cart = useCart()
  const colors = flower.colors?.length ? flower.colors : ['']
  const [color, setColor] = useState(colors[0])
  const qty = cart.qtyOf(flower.id, color)
  const key = color ? `${flower.id}::${color}` : flower.id

  const add = () =>
    cart.add({ kind: 'flower', refId: flower.id, name: flower.name, color, image_url: flower.image_url, emoji: flower.emoji })

  return (
    <article className="card flower-card">
      <Photo src={flower.image_url} emoji={flower.emoji} seed={flower.id} alt={flower.name} className="flower-photo" />
      <div className="flower-card-body">
        <h4>{flower.name}</h4>
        {colors.length > 1 ? (
          <div className="swatches">
            {colors.map((c) => (
              <button key={c} className={'chip-btn chip-xs' + (c === color ? ' active' : '')} onClick={() => setColor(c)}>
                {c}
              </button>
            ))}
          </div>
        ) : (
          colors[0] && <span className="muted small">{colors[0]}</span>
        )}
        {qty > 0 ? (
          <QuantityStepper value={qty} onChange={(q) => cart.setQty(key, q)} label={`${color} ${flower.name}`} />
        ) : (
          <button className="btn btn-small btn-ghost" onClick={add}>+ Add</button>
        )}
      </div>
    </article>
  )
}
