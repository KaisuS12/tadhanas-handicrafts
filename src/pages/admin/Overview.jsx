import { updateRow } from '../../lib/db.js'
import { settings as sampleSettings } from '../../data/shop.js'
import Photo from '../../components/Photo.jsx'

const on = (r) => r.active !== false

export default function Overview({ all, go, onChanged, notify }) {
  if (!all) return <p className="muted">Loading your shop…</p>

  const { bouquets, flowers, options, settings } = all

  const outOfStock = [
    ...flowers.filter((r) => !on(r)).map((r) => ({ row: r, table: 'flowers' })),
    ...options.filter((r) => !on(r)).map((r) => ({ row: r, table: 'options' })),
  ]
  const noPhoto = bouquets.filter((b) => on(b) && !b.image_url)
  const noRecipe = bouquets.filter((b) => on(b) && !(b.recipe?.length > 0))
  const messengerUnset = !settings?.messenger_username || settings.messenger_username === sampleSettings.messenger_username

  async function restock({ row, table }) {
    try {
      await updateRow(table, row.id, { active: true })
      onChanged()
      notify(`${row.name} is back in stock ✓`)
    } catch (err) {
      notify('Something went wrong: ' + err.message)
    }
  }

  const stats = [
    { label: 'Bouquets showing', value: bouquets.filter(on).length, total: bouquets.length, go: 'bouquets' },
    { label: 'Flowers in stock', value: flowers.filter((f) => on(f) && f.type !== 'filler').length, total: flowers.filter((f) => f.type !== 'filler').length, go: 'flowers' },
    { label: 'Fillers in stock', value: flowers.filter((f) => on(f) && f.type === 'filler').length, total: flowers.filter((f) => f.type === 'filler').length, go: 'fillers' },
    { label: 'Out of stock', value: outOfStock.length, warn: outOfStock.length > 0, go: 'flowers' },
  ]

  const tasks = outOfStock.length + noPhoto.length + noRecipe.length + (messengerUnset ? 1 : 0)

  return (
    <div className="adm-overview">
      <div className="adm-stats">
        {stats.map((s) => (
          <button key={s.label} className={'adm-stat' + (s.warn ? ' warn' : '')} onClick={() => go(s.go)}>
            <span className="adm-stat-value">
              {s.value}
              {s.total !== undefined && <small> / {s.total}</small>}
            </span>
            <span className="adm-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="adm-quick">
        <button className="btn" onClick={() => go('bouquets', 'new')}>+ Add a bouquet</button>
        <button className="btn btn-ghost" onClick={() => go('flowers', 'new')}>+ Add a flower</button>
        <button className="btn btn-ghost" onClick={() => go('settings')}>Edit shop info</button>
      </div>

      <section className="adm-panel">
        <h2>Needs attention {tasks > 0 && <span className="adm-pill warn">{tasks}</span>}</h2>
        {tasks === 0 && <p className="adm-allgood">✓ All good. Everything is in stock and every bouquet has a photo.</p>}

        <ul className="adm-tasks">
          {messengerUnset && (
            <li>
              <span className="adm-task-icon">💬</span>
              <div className="adm-task-text">
                <strong>Set your Messenger username</strong>
                <span>Customers send their receipts there. It’s still the sample value.</span>
              </div>
              <button className="btn btn-small" onClick={() => go('settings')}>Fix</button>
            </li>
          )}

          {outOfStock.map((item) => (
            <li key={item.table + item.row.id}>
              <Photo src={item.row.image_url} emoji={item.row.emoji ?? '🎀'} seed={item.row.id} alt={item.row.name} className="adm-task-thumb" />
              <div className="adm-task-text">
                <strong>{item.row.name}</strong>
                <span>Out of stock · hidden from customers</span>
              </div>
              <button className="btn btn-small btn-ghost" onClick={() => restock(item)}>Back in stock</button>
            </li>
          ))}

          {noPhoto.map((b) => (
            <li key={'photo' + b.id}>
              <Photo src="" emoji={b.emoji} seed={b.id} alt={b.name} className="adm-task-thumb" />
              <div className="adm-task-text">
                <strong>{b.code && `#${b.code} `}{b.name}</strong>
                <span>No photo yet. Customers see a placeholder.</span>
              </div>
              <button className="btn btn-small btn-ghost" onClick={() => go('bouquets', { id: b.id })}>Add photo</button>
            </li>
          ))}

          {noRecipe.map((b) => (
            <li key={'recipe' + b.id}>
              <Photo src={b.image_url} emoji={b.emoji} seed={b.id} alt={b.name} className="adm-task-thumb" />
              <div className="adm-task-text">
                <strong>{b.code && `#${b.code} `}{b.name}</strong>
                <span>“What’s inside” is empty, so there’s no “Make one like this” button.</span>
              </div>
              <button className="btn btn-small btn-ghost" onClick={() => go('bouquets', { id: b.id })}>Add flowers</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
