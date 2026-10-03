import { useEffect, useState } from 'react'
import { selectAll } from '../../lib/db.js'
import QuantityStepper from '../../components/QuantityStepper.jsx'

// "What's inside" a bouquet: rows of flower + color + how many.
// Also picks the wrap. Includes out-of-stock items so old bouquets stay editable.
export default function RecipeEditor({ recipe = [], wrapperId = '', onChange, onWrapperChange }) {
  const [flowers, setFlowers] = useState([])
  const [wrappers, setWrappers] = useState([])

  useEffect(() => {
    selectAll('flowers').then(setFlowers)
    selectAll('options').then((rows) => setWrappers(rows.filter((o) => o.kind === 'wrapper')))
  }, [])

  const flowerById = (id) => flowers.find((f) => f.id === id)
  const update = (idx, patch) => onChange(recipe.map((r, i) => (i === idx ? { ...r, ...patch } : r)))

  function addRow() {
    const first = flowers[0]
    if (first) onChange([...recipe, { flower_id: first.id, color: first.colors?.[0] ?? '', qty: 1 }])
  }

  function pickFlower(idx, id) {
    update(idx, { flower_id: id, color: flowerById(id)?.colors?.[0] ?? '' })
  }

  return (
    <div className="recipe-editor">
      {recipe.length === 0 && <p className="muted small">No flowers listed yet. Customers won’t see “Make one like this” until you add some.</p>}
      {recipe.map((r, idx) => {
        const flower = flowerById(r.flower_id)
        return (
          <div className="recipe-row" key={idx}>
            <QuantityStepper value={r.qty} min={1} onChange={(qty) => update(idx, { qty })} label="stems" />
            <select value={r.flower_id} onChange={(e) => pickFlower(idx, e.target.value)} aria-label="Flower">
              {!flower && <option value={r.flower_id}>(deleted flower)</option>}
              {flowers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.type === 'filler' ? ' (filler)' : ''}{f.active === false ? ' (out of stock)' : ''}
                </option>
              ))}
            </select>
            {flower?.colors?.length > 0 && (
              <select value={r.color} onChange={(e) => update(idx, { color: e.target.value })} aria-label="Color">
                {flower.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
            <button type="button" className="icon-btn danger" onClick={() => onChange(recipe.filter((_, i) => i !== idx))} aria-label="Remove">×</button>
          </div>
        )
      })}
      <button type="button" className="btn btn-small btn-ghost" onClick={addRow}>+ Add flower</button>

      <label className="recipe-wrap">
        Wrap used
        <select value={wrapperId} onChange={(e) => onWrapperChange(e.target.value)}>
          <option value="">(none)</option>
          {wrappers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </label>
    </div>
  )
}
