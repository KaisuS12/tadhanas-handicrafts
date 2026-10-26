import { useState } from 'react'
import Photo from './Photo.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import { useCart } from '../lib/cart.jsx'
import { flyToCart } from '../lib/flyToCart.js'

// Color names the owner types in admin → a swatch color (unknown names get kraft)
const SWATCH = {
  red: '#c0392b', pink: '#e79bb0', white: '#fbf8f2', yellow: '#f2c94c', peach: '#f6b48f', purple: '#9b6bb8',
  lavender: '#c3b1e1', orange: '#e8833a', blue: '#6c8ebf', green: '#7f9b74', cream: '#f3e7cf', black: '#2d2a2a',
  coral: '#f08a7a', maroon: '#7b2635', violet: '#8e5bb5', gold: '#d4a73a', mixed: 'conic-gradient(#e79bb0, #f2c94c, #9b6bb8, #e79bb0)',
}
const swatchFor = (name) => SWATCH[name.toLowerCase()] ?? '#d9bf9c'

export default function FlowerCard({ flower }) {
  const cart = useCart()
  const colors = flower.colors?.length ? flower.colors : ['']
  const [color, setColor] = useState(colors[0])
  const qty = cart.qtyOf(flower.id, color)
  const key = color ? `${flower.id}::${color}` : flower.id

  const add = (e) => {
    flyToCart(e?.currentTarget.closest('.seed-packet')?.querySelector('.photo'))
    cart.add({ kind: 'flower', refId: flower.id, name: flower.name, color, image_url: flower.image_url, emoji: flower.emoji })
  }

  return (
    <article className="seed-packet">
      <div className="packet-band">
        <h4>{flower.name}</h4>
      </div>
      <Photo src={flower.image_url} emoji={flower.emoji} seed={flower.id} alt={flower.name} className="flower-photo" />
      <div className="flower-card-body">
        {colors[0] && (
          <>
            <div className="swatches" role="radiogroup" aria-label={`${flower.name} color`}>
              {colors.map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={c === color}
                  aria-label={c}
                  title={c}
                  className={'swatch' + (c === color ? ' active' : '')}
                  style={{ '--sw': swatchFor(c) }}
                  onClick={() => setColor(c)}
                  disabled={colors.length === 1}
                />
              ))}
            </div>
            <span className="swatch-name hand">{color}</span>
          </>
        )}
        {qty > 0 ? (
          <QuantityStepper value={qty} onChange={(q) => cart.setQty(key, q)} label={`${color} ${flower.name}`} />
        ) : (
          <button className="btn btn-small btn-ghost packet-add" onClick={add}>+ Add</button>
        )}
      </div>
    </article>
  )
}
