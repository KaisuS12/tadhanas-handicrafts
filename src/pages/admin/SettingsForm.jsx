import { useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../../lib/db.js'

const GROUPS = [
  {
    title: 'Your shop',
    fields: [
      { name: 'name', label: 'Shop name' },
      { name: 'tagline', label: 'Tagline', hint: 'The big line at the top of your home page.' },
    ],
  },
  {
    title: 'How customers reach you',
    fields: [
      { name: 'messenger_username', label: 'Messenger / Facebook page username', hint: 'The part after m.me/ or facebook.com/. Receipts are sent here.', test: true },
      { name: 'facebook_url', label: 'Facebook page link', placeholder: 'https://facebook.com/…' },
      { name: 'phone', label: 'Phone', type: 'tel' },
    ],
  },
  {
    title: 'Store details',
    fields: [
      { name: 'location', label: 'Location' },
      { name: 'hours', label: 'Store hours', placeholder: 'Mon–Sat, 9AM–7PM' },
    ],
  },
]

export default function SettingsForm({ onChanged, notify }) {
  const [saved, setSaved] = useState(null)
  const [row, setRow] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSettings().then(
      (s) => {
        setSaved(s)
        setRow(s)
      },
      (err) => notify('Load failed: ' + err.message),
    )
  }, [notify])

  const dirty = row && JSON.stringify(row) !== JSON.stringify(saved)

  async function save(e) {
    e.preventDefault()
    // eslint-disable-next-line no-unused-vars
    const { id, ...values } = row
    setBusy(true)
    try {
      await saveSettings(values)
      setSaved(row)
      onChanged()
      notify('Shop info saved ✓')
    } catch (err) {
      notify('Save failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!row) return <p className="muted">Loading…</p>
  return (
    <form className="adm-settings" onSubmit={save}>
      {GROUPS.map((g) => (
        <section key={g.title} className="adm-panel">
          <h2>{g.title}</h2>
          {g.fields.map((f) => (
            <label key={f.name} className="adm-field">
              <span className="adm-label">{f.label}</span>
              <span className="adm-input-row">
                <input type={f.type ?? 'text'} value={row[f.name] ?? ''} placeholder={f.placeholder} onChange={(e) => setRow({ ...row, [f.name]: e.target.value.trimStart() })} />
                {f.test && row[f.name] && (
                  <a className="btn btn-small btn-ghost" href={`https://m.me/${row[f.name].trim()}`} target="_blank" rel="noreferrer">Test link ↗</a>
                )}
              </span>
              {f.hint && <span className="adm-hint">{f.hint}</span>}
            </label>
          ))}
        </section>
      ))}
      <div className={'adm-savebar' + (dirty ? ' show' : '')}>
        <span>You have unsaved changes</span>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setRow(saved)}>Undo</button>
        <button className="btn btn-small" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  )
}
