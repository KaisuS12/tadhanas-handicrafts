import { useCallback, useEffect, useRef, useState } from 'react'
import { selectAll, insertRow, updateRow, deleteRow, uploadPhoto } from '../../lib/db.js'
import useLockScroll from '../../lib/useLockScroll.js'
import Photo from '../../components/Photo.jsx'
import RecipeEditor from './RecipeEditor.jsx'

// Manages one table: searchable cards/rows plus a side-panel editor.
// where: only show rows matching these values (e.g. { type: 'filler' }); new rows get them too.
// openEdit: { id } or 'new' to open the editor straight away (from Overview).
export default function CrudTable({ table, where = {}, fields, itemLabel, autoCode, layout, newRow, stockLabels, openEdit, onChanged, notify }) {
  const [rows, setRows] = useState(null)
  const [editing, setEditing] = useState(null) // row being edited, or a new row
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | on | off

  const whereKey = JSON.stringify(where)
  const load = useCallback(async () => {
    try {
      const all = await selectAll(table)
      const match = JSON.parse(whereKey)
      const list = all.filter((r) => Object.entries(match).every(([k, v]) => r[k] === v))
      setRows(list)
      return list
    } catch (err) {
      notify('Load failed: ' + err.message)
      return []
    }
  }, [table, whereKey, notify])

  // First load, then open the editor if Overview asked for it
  const openRef = useRef(openEdit)
  useEffect(() => {
    load().then((list) => {
      const want = openRef.current
      openRef.current = null
      if (want === 'new') setEditing(newRow())
      else if (want?.id) setEditing(list.find((r) => r.id === want.id) ?? null)
    })
  }, [load, newRow])

  async function run(action, message) {
    setBusy(true)
    try {
      await action()
      await load()
      onChanged()
      notify(message)
      return true
    } catch (err) {
      notify('Something went wrong: ' + err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function save(row) {
    const { id, ...values } = row
    if (autoCode && !values.code?.trim()) values.code = nextCode(rows, autoCode)
    const nextSort = Math.max(0, ...rows.map((r) => r.sort ?? 0)) + 1
    const ok = await run(
      () => (id ? updateRow(table, id, values) : insertRow(table, { ...values, ...where, sort: nextSort })),
      `${values.name} saved ✓`,
    )
    if (ok) setEditing(null)
  }

  async function remove(row) {
    if (!confirm(`Delete “${row.name}”? This can’t be undone.\n\nTip: if it’s only out of stock, use the stock switch instead.`)) return
    if (await run(() => deleteRow(table, row.id), `${row.name} deleted`)) setEditing(null)
  }

  const toggleStock = (row) =>
    run(() => updateRow(table, row.id, { active: row.active === false }), `${row.name}: ${row.active === false ? stockLabels.on : stockLabels.off}`)

  async function move(row, dir) {
    const index = rows.findIndex((r) => r.id === row.id)
    const other = rows[index + dir]
    if (!other) return
    // Swap positions; if both share a sort value, use their list positions instead
    const same = (row.sort ?? 0) === (other.sort ?? 0)
    const [a, b] = same ? [index + dir, index] : [other.sort, row.sort]
    await run(async () => {
      await updateRow(table, row.id, { sort: a })
      await updateRow(table, other.id, { sort: b })
    }, dir < 0 ? `${row.name} moved earlier` : `${row.name} moved later`)
  }

  if (!rows) return <p className="muted">Loading…</p>

  const q = query.trim().toLowerCase()
  const shown = rows.filter((r) => {
    if (filter === 'on' && r.active === false) return false
    if (filter === 'off' && r.active !== false) return false
    if (!q) return true
    return [r.name, r.code, r.category, ...(r.colors ?? [])].some((v) => v?.toLowerCase().includes(q))
  })
  const offCount = rows.filter((r) => r.active === false).length
  const summaryOf = (row) => fields.filter((f) => f.summary).map((f) => [].concat(row[f.name] ?? []).join(', ')).filter(Boolean).join(' · ')

  const itemProps = (row) => ({
    row,
    stockLabels,
    busy,
    summary: summaryOf(row),
    isFirst: rows[0]?.id === row.id,
    isLast: rows[rows.length - 1]?.id === row.id,
    onEdit: () => setEditing(row),
    onToggle: () => toggleStock(row),
    onMove: (dir) => move(row, dir),
    onDelete: () => remove(row),
  })

  return (
    <div className="adm-manager">
      <div className="adm-toolbar">
        {rows.length > 4 && (
          <input className="adm-search" type="search" placeholder={`Search ${itemLabel}s…`} value={query} onChange={(e) => setQuery(e.target.value)} />
        )}
        <div className="adm-seg" role="tablist" aria-label="Filter">
          {[
            ['all', `All ${rows.length}`],
            ['on', `${stockLabels.on} ${rows.length - offCount}`],
            ['off', `${stockLabels.off} ${offCount}`],
          ].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn adm-add" onClick={() => setEditing(newRow())}>+ Add {itemLabel}</button>
      </div>

      {shown.length === 0 ? (
        <div className="adm-empty">
          {rows.length === 0 ? (
            <>
              <p>No {itemLabel}s yet.</p>
              <button className="btn" onClick={() => setEditing(newRow())}>+ Add your first {itemLabel}</button>
            </>
          ) : (
            <p>Nothing matches. Try another search or filter.</p>
          )}
        </div>
      ) : layout === 'cards' ? (
        <div className="adm-cards">
          {shown.map((row) => <ItemCard key={row.id} {...itemProps(row)} />)}
        </div>
      ) : (
        <ul className="adm-rows">
          {shown.map((row) => <ItemRow key={row.id} {...itemProps(row)} />)}
        </ul>
      )}

      {editing && (
        <Drawer
          fields={fields}
          itemLabel={itemLabel}
          initial={editing}
          busy={busy}
          folder={table}
          notify={notify}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={editing.id ? () => remove(editing) : null}
        />
      )}
    </div>
  )
}

// Next free code like B007 (highest existing number + 1)
function nextCode(rows, prefix) {
  const nums = rows.map((r) => r.code?.match(new RegExp(`^${prefix}(\\d+)$`, 'i'))?.[1]).filter(Boolean).map(Number)
  return prefix + String(Math.max(0, ...nums) + 1).padStart(3, '0')
}

// ---------- List items ----------
function StockSwitch({ on, labels, busy, onToggle }) {
  return (
    <button className={'stock-switch' + (on ? ' on' : '')} onClick={onToggle} disabled={busy} aria-pressed={on}>
      <span className="stock-knob" aria-hidden="true" />
      {on ? labels.on : labels.off}
    </button>
  )
}

function MoreMenu({ isFirst, isLast, busy, onMove, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  const pick = (fn) => () => {
    setOpen(false)
    fn()
  }
  return (
    <div className="adm-more" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="More actions">⋯</button>
      {open && (
        <div className="adm-menu" role="menu">
          <button role="menuitem" disabled={busy || isFirst} onClick={pick(() => onMove(-1))}>↑ Move earlier</button>
          <button role="menuitem" disabled={busy || isLast} onClick={pick(() => onMove(1))}>↓ Move later</button>
          <button role="menuitem" className="danger" disabled={busy} onClick={pick(onDelete)}>🗑 Delete</button>
        </div>
      )}
    </div>
  )
}

function ItemCard({ row, summary, stockLabels, busy, onEdit, onToggle, ...menu }) {
  const on = row.active !== false
  return (
    <article className={'adm-card' + (on ? '' : ' off')}>
      <button className="adm-card-photo" onClick={onEdit} aria-label={`Edit ${row.name}`}>
        <Photo src={row.image_url} emoji={row.emoji} seed={row.id} alt={row.name} />
        {row.code && <span className="code-badge">#{row.code}</span>}
        {!on && <span className="adm-card-flag">{stockLabels.off}</span>}
        {!row.image_url && <span className="adm-card-nophoto">No photo</span>}
      </button>
      <div className="adm-card-body">
        <button className="adm-card-name" onClick={onEdit}>{row.name}</button>
        {summary && <p className="adm-card-sub">{summary}</p>}
        <div className="adm-card-foot">
          <StockSwitch on={on} labels={stockLabels} busy={busy} onToggle={onToggle} />
          <MoreMenu busy={busy} {...menu} />
        </div>
      </div>
    </article>
  )
}

function ItemRow({ row, summary, stockLabels, busy, onEdit, onToggle, ...menu }) {
  const on = row.active !== false
  return (
    <li className={'adm-row' + (on ? '' : ' off')}>
      <button className="adm-row-name" onClick={onEdit}>
        <strong>{row.name}</strong>
        {summary && <span>{summary}</span>}
      </button>
      <StockSwitch on={on} labels={stockLabels} busy={busy} onToggle={onToggle} />
      <button className="btn btn-small btn-ghost" onClick={onEdit}>Edit</button>
      <MoreMenu busy={busy} {...menu} />
    </li>
  )
}

// ---------- Editor panel ----------
function Drawer({ fields, itemLabel, initial, busy, folder, notify, onClose, onSave, onDelete }) {
  const [row, setRow] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const dirty = JSON.stringify(row) !== JSON.stringify(initial)
  const set = (name, value) => setRow((r) => ({ ...r, [name]: value }))
  useLockScroll(true)

  const close = useCallback(() => {
    if (dirty && !confirm('Discard your changes?')) return
    onClose()
  }, [dirty, onClose])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  async function upload(name, file) {
    if (!file) return
    setUploading(true)
    try {
      set(name, await uploadPhoto(file, folder))
    } catch (err) {
      notify('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const main = fields.filter((f) => !f.small)
  const extra = fields.filter((f) => f.small)

  return (
    <div className="adm-drawer-wrap" role="dialog" aria-modal="true" aria-label={row.id ? `Edit ${initial.name}` : `New ${itemLabel}`}>
      <div className="adm-drawer-backdrop" onClick={close} />
      <form
        className="adm-drawer"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(row)
        }}
      >
        <header className="adm-drawer-head">
          <h2>{row.id ? `Edit ${initial.name}` : `New ${itemLabel}`}</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close">✕</button>
        </header>

        <div className="adm-drawer-body">
          {main.map((f) => (
            <Field key={f.name} f={f} row={row} set={set} uploading={uploading} upload={upload} />
          ))}
          {extra.length > 0 && (
            <details className="adm-extra">
              <summary>More options</summary>
              {extra.map((f) => (
                <Field key={f.name} f={f} row={row} set={set} uploading={uploading} upload={upload} />
              ))}
            </details>
          )}
        </div>

        <footer className="adm-drawer-foot">
          {onDelete && (
            <button type="button" className="adm-delete" onClick={onDelete} disabled={busy}>Delete</button>
          )}
          <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
          <button className="btn" disabled={busy || uploading || !dirty}>{busy ? 'Saving…' : 'Save'}</button>
        </footer>
      </form>
    </div>
  )
}

function Field({ f, row, set, uploading, upload }) {
  const value = row[f.name]
  if (f.type === 'image') {
    return (
      <div className="adm-field">
        <span className="adm-label">{f.label}</span>
        <label
          className={'adm-photo-drop' + (value ? ' has-photo' : '')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            upload(f.name, e.dataTransfer.files[0])
          }}
        >
          {value ? <img src={value} alt="" /> : <span className="adm-photo-empty"><span aria-hidden="true">📷</span>Tap to add a photo<small>or drop one here</small></span>}
          {uploading && <span className="adm-photo-busy">Uploading…</span>}
          <input type="file" accept="image/*" onChange={(e) => upload(f.name, e.target.files[0])} hidden />
        </label>
        {value && (
          <div className="adm-photo-actions">
            <label className="link-btn">Change photo<input type="file" accept="image/*" onChange={(e) => upload(f.name, e.target.files[0])} hidden /></label>
            <button type="button" className="link-btn" onClick={() => set(f.name, '')}>Remove</button>
          </div>
        )}
      </div>
    )
  }

  if (f.type === 'recipe') {
    return (
      <div className="adm-field">
        <span className="adm-label">{f.label}</span>
        <RecipeEditor recipe={row.recipe} wrapperId={row.wrapper_id} onChange={(r) => set('recipe', r)} onWrapperChange={(id) => set('wrapper_id', id)} />
      </div>
    )
  }

  return (
    <label className="adm-field">
      <span className="adm-label">{f.label}</span>
      {f.type === 'text' && <input value={value ?? ''} onChange={(e) => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder} />}
      {f.type === 'textarea' && <textarea rows={3} value={value ?? ''} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />}
      {f.type === 'tags' && <TagInput value={value ?? []} onChange={(v) => set(f.name, v)} placeholder={f.placeholder} />}
      {f.type === 'category' && (
        <>
          <input value={value ?? ''} onChange={(e) => set(f.name, e.target.value)} placeholder="Pick one below or type your own" />
          <span className="adm-suggest">
            {f.suggestions.map((s) => (
              <button type="button" key={s} className={'chip-btn chip-xs' + (value === s ? ' active' : '')} onClick={() => set(f.name, s)}>{s}</button>
            ))}
          </span>
        </>
      )}
      {f.hint && <span className="adm-hint">{f.hint}</span>}
    </label>
  )
}

// Colors as removable chips; Enter or comma adds one
function TagInput({ value, onChange, placeholder }) {
  const [text, setText] = useState('')

  function addAll(raw) {
    const next = [...value]
    for (const part of raw.split(',')) {
      const t = part.trim()
      if (t && !next.some((v) => v.toLowerCase() === t.toLowerCase())) next.push(t)
    }
    if (next.length !== value.length) onChange(next)
  }

  function handleChange(e) {
    const v = e.target.value
    if (!v.includes(',')) return setText(v)
    // Everything before the last comma becomes tags; the rest stays typed
    const cut = v.lastIndexOf(',')
    addAll(v.slice(0, cut))
    setText(v.slice(cut + 1))
  }

  return (
    <div className="adm-tags">
      {value.map((t) => (
        <span key={t} className="adm-tag">
          {t}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input
        value={text}
        placeholder={value.length ? 'Add another…' : placeholder}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addAll(text)
            setText('')
          } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1))
        }}
        onBlur={() => {
          addAll(text)
          setText('')
        }}
      />
    </div>
  )
}
